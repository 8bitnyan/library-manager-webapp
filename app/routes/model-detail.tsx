import { eq } from 'drizzle-orm';
import { lazy, Suspense } from 'react';
import { Form, Link, redirect } from 'react-router';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { Skeleton } from '~/components/ui/skeleton';
import { db } from '~/lib/db.server';
import { categories, models, modelTags } from '~/db/schema';
import type { Route } from './+types/model-detail';

const ModelViewer = lazy(() => import('~/components/model-viewer'));

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: Date | number | string | null | undefined): string {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('ko-KR');
}

export function meta({ data }: Route.MetaArgs) {
  const name = data?.model.name ?? '모델 상세';
  return [{ title: `${name} - 3D 모델 저장소` }];
}

export async function loader({ params }: Route.LoaderArgs) {
  const id = params.id;
  if (!id) {
    throw new Response('모델을 찾을 수 없습니다.', { status: 404 });
  }

  const model = (await db
    .select({
      id: models.id,
      name: models.name,
      description: models.description,
      fileType: models.fileType,
      fileSize: models.fileSize,
      fileName: models.fileName,
      fileUrl: models.fileUrl,
      categoryName: categories.name,
      createdAt: models.createdAt,
      updatedAt: models.updatedAt,
    })
    .from(models)
    .leftJoin(categories, eq(models.categoryId, categories.id))
    .where(eq(models.id, id)))[0];

  if (!model) {
    throw new Response('모델을 찾을 수 없습니다.', { status: 404 });
  }

  const tagRows = await db
    .select({ tag: modelTags.tag })
    .from(modelTags)
    .where(eq(modelTags.modelId, model.id));

  return {
    model,
    tags: tagRows.map((row: { tag: string }) => row.tag),
    fileUrl: model.fileUrl ?? `/api/models/${model.id}/file`,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const id = params.id;
  if (!id) {
    throw new Response('모델을 찾을 수 없습니다.', { status: 404 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent !== 'delete') {
    throw new Response('잘못된 요청입니다.', { status: 400 });
  }

  const model = (await db
    .select({ id: models.id })
    .from(models)
    .where(eq(models.id, id)))[0];

  if (!model) {
    throw new Response('모델을 찾을 수 없습니다.', { status: 404 });
  }

  await db.delete(modelTags).where(eq(modelTags.modelId, model.id));
  await db.delete(models).where(eq(models.id, model.id));

  return redirect('/models');
}

export default function ModelDetailPage({ loaderData }: Route.ComponentProps) {
  const { model, tags, fileUrl } = loaderData;
  const canPreview = ['stl', 'gltf', 'glb', 'step', 'stp'].includes(model.fileType);
  const noPreview = ['obj', 'fbx'].includes(model.fileType);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>3D 미리보기</CardTitle>
          <CardDescription>{model.fileName}</CardDescription>
        </CardHeader>
        <CardContent>
          {canPreview ? (
            <Suspense fallback={<Skeleton className="aspect-square w-full rounded-lg" />}>
              <ModelViewer url={fileUrl} fileType={model.fileType} />
            </Suspense>
          ) : noPreview ? (
            <div className="flex aspect-square w-full items-center justify-center rounded-lg border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              이 파일 형식은 미리보기를 지원하지 않습니다
            </div>
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-lg border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              지원하지 않는 파일 형식입니다
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <CardTitle>{model.name}</CardTitle>
              <CardDescription>{model.description || '설명이 없습니다.'}</CardDescription>
            </div>
            <Badge variant="secondary" className="uppercase">
              {model.fileType}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <dl className="grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">파일 크기</dt>
              <dd>{formatFileSize(model.fileSize)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">카테고리</dt>
              <dd>{model.categoryName ?? '미분류'}</dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-muted-foreground">태그</dt>
              <dd className="flex flex-wrap justify-end gap-2">
                {tags.length > 0 ? (
                  tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">태그 없음</span>
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">등록일</dt>
              <dd>{formatDate(model.createdAt)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">수정일</dt>
              <dd>{formatDate(model.updatedAt)}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <a href={`${fileUrl}?download=1`} download={model.fileName}>
                다운로드
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/models/${model.id}/edit`}>수정</Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">삭제</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>모델을 삭제하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    삭제 후에는 되돌릴 수 없습니다. 파일과 태그 정보도 함께 제거됩니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <Form method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <Button type="submit" variant="destructive">
                      삭제
                    </Button>
                  </Form>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}