import { redirect, useActionData, useLoaderData, useNavigation, useSubmit } from 'react-router';
import { useState } from 'react';
import { categories, models, modelTags } from '~/db/schema';
import { db } from '~/lib/db.server';
import { useUploadThing } from '~/lib/uploadthing';
import { uploadFormSchema } from '~/lib/validators';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import type { Route } from './+types/upload';

type ActionData = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const meta: Route.MetaFunction = () => [{ title: '모델 업로드 - 3D 모델 저장소' }];

export async function loader() {
  const categoryList = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories);

  return { categories: categoryList };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = String(formData.get('name') ?? '');
  const description = String(formData.get('description') ?? '');
  const categoryIdRaw = String(formData.get('categoryId') ?? '');
  const tagsRaw = String(formData.get('tags') ?? '');
  const fileUrl = String(formData.get('fileUrl') ?? '');
  const fileName = String(formData.get('fileName') ?? '');
  const fileType = String(formData.get('fileType') ?? '').toLowerCase();
  const fileSizeRaw = String(formData.get('fileSize') ?? '');
  const fileSize = Number(fileSizeRaw);

  const parsed = uploadFormSchema.safeParse({
    name,
    description,
    categoryId: categoryIdRaw || undefined,
    tags: tagsRaw,
  });

  if (!parsed.success) {
    return {
      error: '입력값을 확인해주세요.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    } satisfies ActionData;
  }

  if (!fileUrl || !fileName || !fileType || !Number.isFinite(fileSize) || fileSize <= 0) {
    return { error: '파일 업로드를 먼저 완료해주세요.' } satisfies ActionData;
  }

  const id = crypto.randomUUID();

  await db.insert(models).values({
    id,
    name: parsed.data.name,
    description: parsed.data.description || null,
    fileType,
    fileSize,
    fileName,
    fileUrl,
    categoryId: categoryIdRaw ? Number(categoryIdRaw) : null,
  });

  const tags = [...new Set(tagsRaw.split(',').map((tag) => tag.trim()).filter(Boolean))];
  if (tags.length > 0) {
    await db.insert(modelTags).values(tags.map((tag) => ({ modelId: id, tag })));
  }

  return redirect(`/models/${id}`);
}

export default function UploadPage() {
  const { categories } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as ActionData | undefined;
  const navigation = useNavigation();
  const submit = useSubmit();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { startUpload, isUploading } = useUploadThing('modelUploader', {
    uploadProgressGranularity: 'fine',
    onUploadProgress: (progress) => setUploadProgress(progress),
  });

  const isSubmitting = navigation.state === 'submitting';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    if (!selectedFile) {
      setUploadError('업로드할 파일을 선택해주세요.');
      return;
    }

    const uploadResult = await startUpload([selectedFile]);
    const uploadedFile = uploadResult?.[0];

    if (!uploadedFile) {
      setUploadError('파일 업로드에 실패했습니다. 다시 시도해주세요.');
      return;
    }

    formData.set('fileUrl', uploadedFile.ufsUrl);
    formData.set('fileName', uploadedFile.name);
    formData.set('fileType', selectedFile.name.split('.').pop()?.toLowerCase() ?? '');
    formData.set('fileSize', String(uploadedFile.size));
    formData.delete('file');

    submit(formData, { method: 'post' });
  };

  return (
    <div className='mx-auto w-full max-w-2xl space-y-6 p-4'>
      <div className='space-y-2'>
        <h1 className='text-2xl font-semibold'>모델 업로드</h1>
        <p className='text-sm text-muted-foreground'>3D 모델 파일을 업로드하고 정보를 입력하세요.</p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-5 rounded-lg border p-6'>
        <div className='space-y-2'>
          <Label htmlFor='file'>파일</Label>
          <Input
            id='file'
            name='file'
            type='file'
            accept='.stl,.gltf,.glb,.obj,.fbx,.step,.stp'
            onChange={(event) => {
              setSelectedFile(event.currentTarget.files?.[0] ?? null);
              setUploadProgress(0);
              setUploadError(null);
            }}
            required
          />
          {selectedFile ? (
            <p className='text-sm text-muted-foreground'>
              선택된 파일: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          ) : null}
          {isUploading ? <p className='text-sm text-muted-foreground'>업로드 진행률: {uploadProgress}%</p> : null}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='name'>모델 이름</Label>
          <Input id='name' name='name' placeholder='예: 기어 박스 하우징' required />
          {actionData?.fieldErrors?.name?.[0] ? (
            <p className='text-sm text-destructive'>{actionData.fieldErrors.name[0]}</p>
          ) : null}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='description'>설명</Label>
          <Textarea id='description' name='description' placeholder='모델 설명을 입력하세요.' rows={4} />
          {actionData?.fieldErrors?.description?.[0] ? (
            <p className='text-sm text-destructive'>{actionData.fieldErrors.description[0]}</p>
          ) : null}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='categoryId'>카테고리</Label>
          <select
            id='categoryId'
            name='categoryId'
            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background'
          >
            <option value=''>선택 안 함</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {actionData?.fieldErrors?.categoryId?.[0] ? (
            <p className='text-sm text-destructive'>{actionData.fieldErrors.categoryId[0]}</p>
          ) : null}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='tags'>태그</Label>
          <Input id='tags' name='tags' placeholder='예: 기계, 조립, 프로토타입' />
          <p className='text-xs text-muted-foreground'>쉼표(,)로 구분해 입력하세요.</p>
          {actionData?.fieldErrors?.tags?.[0] ? (
            <p className='text-sm text-destructive'>{actionData.fieldErrors.tags[0]}</p>
          ) : null}
        </div>

        {uploadError ? <p className='text-sm text-destructive'>{uploadError}</p> : null}
        {actionData?.error ? <p className='text-sm text-destructive'>{actionData.error}</p> : null}

        <Button type='submit' className='w-full' disabled={isUploading || isSubmitting}>
          {isUploading ? '파일 업로드 중...' : isSubmitting ? '저장 중...' : '업로드하기'}
        </Button>
      </form>
    </div>
  );
}