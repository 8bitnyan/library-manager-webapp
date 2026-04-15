import { eq } from 'drizzle-orm';
import { Form, Link, data, redirect, useActionData, useLoaderData } from 'react-router';
import { db } from '~/lib/db.server';
import { categories, models, modelTags } from '~/db/schema';
import { modelFormSchema } from '~/lib/validators';
import type { Route } from './+types/model-edit';

export function meta() {
  return [{ title: '모델 수정 - 3D 모델 저장소' }];
}

export async function loader({ params }: Route.LoaderArgs) {
  if (!params.id) {
    throw new Response('Not Found', { status: 404 });
  }

  const [model, categoriesList, tags] = await Promise.all([
    db
      .select({
        id: models.id,
        name: models.name,
        description: models.description,
        categoryId: models.categoryId,
      })
      .from(models)
      .where(eq(models.id, params.id))
      .limit(1),
    db.select({ id: categories.id, name: categories.name }).from(categories),
    db.select({ tag: modelTags.tag }).from(modelTags).where(eq(modelTags.modelId, params.id)),
  ]);

  const currentModel = model[0];

  if (!currentModel) {
    throw new Response('Not Found', { status: 404 });
  }

  return data({
    model: currentModel,
    categories: categoriesList,
    tags: tags.map((entry) => entry.tag).join(', '),
  });
}

export async function action({ request, params }: Route.ActionArgs) {
  if (!params.id) {
    throw new Response('Not Found', { status: 404 });
  }

  const formData = await request.formData();
  const values = Object.fromEntries(formData);
  const parsed = modelFormSchema.safeParse(values);

  if (!parsed.success) {
    return data(
      {
        errors: parsed.error.flatten().fieldErrors,
        values,
      },
      { status: 400 },
    );
  }

  const existing = await db.select({ id: models.id }).from(models).where(eq(models.id, params.id)).limit(1);
  if (!existing[0]) {
    throw new Response('Not Found', { status: 404 });
  }

  const tags = (parsed.data.tags ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  await db.transaction(async (tx) => {
    await tx
      .update(models)
      .set({
        name: parsed.data.name,
        description: parsed.data.description || null,
        categoryId: parsed.data.categoryId ? Number(parsed.data.categoryId) : null,
      })
      .where(eq(models.id, params.id));

    await tx.delete(modelTags).where(eq(modelTags.modelId, params.id));

    if (tags.length > 0) {
      await tx.insert(modelTags).values(
        tags.map((tag) => ({
          modelId: params.id,
          tag,
        })),
      );
    }
  });

  return redirect(`/models/${params.id}`);
}

export default function ModelEditRoute() {
  const { model, categories, tags } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const values = actionData?.values ?? {};

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">모델 수정</h1>

      <Form method="post" className="space-y-4 rounded-lg border p-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            모델명
          </label>
          <input
            id="name"
            name="name"
            defaultValue={(values.name as string) ?? model.name}
            className="h-10 w-full rounded-md border px-3"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            설명
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={(values.description as string) ?? (model.description ?? '')}
            className="min-h-28 w-full rounded-md border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="categoryId" className="text-sm font-medium">
            카테고리
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={(values.categoryId as string) ?? (model.categoryId ? String(model.categoryId) : '')}
            className="h-10 w-full rounded-md border px-3"
          >
            <option value="">카테고리 없음</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="tags" className="text-sm font-medium">
            태그 (쉼표로 구분)
          </label>
          <input
            id="tags"
            name="tags"
            defaultValue={(values.tags as string) ?? tags}
            className="h-10 w-full rounded-md border px-3"
            placeholder="예: vehicle, sci-fi, printable"
          />
        </div>

        {actionData?.errors ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            입력값을 확인해 주세요.
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <Link to={`/models/${model.id}`} className="rounded-md border px-4 py-2 text-sm">
            취소
          </Link>
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            저장
          </button>
        </div>
      </Form>
    </div>
  );
}