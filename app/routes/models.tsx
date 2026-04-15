import { and, asc, desc, eq, exists, like, sql } from 'drizzle-orm';
import { Form, Link, data, useLoaderData } from 'react-router';
import ModelCard from '~/components/model-card';
import { db } from '~/lib/db.server';
import { categories, models, modelTags } from '~/db/schema';
import { searchParamsSchema } from '~/lib/validators';
import type { Route } from './+types/models';

const PAGE_SIZE = 12;

export function meta() {
  return [{ title: '모델 목록 - 3D 모델 저장소' }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const parsed = searchParamsSchema.parse(Object.fromEntries(url.searchParams));

  const q = parsed.q?.trim();
  const categoryId = parsed.categoryId ? Number(parsed.categoryId) : undefined;
  const tag = parsed.tag?.trim();
  const fileType = parsed.fileType?.trim();
  const page = Math.max(1, Number(parsed.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const conditions = [
    q ? sql`(${like(models.name, `%${q}%`)} OR ${like(models.description, `%${q}%`)})` : undefined,
    categoryId ? eq(models.categoryId, categoryId) : undefined,
    fileType ? eq(models.fileType, fileType) : undefined,
    tag
      ? exists(
          db
            .select({ one: sql`1` })
            .from(modelTags)
            .where(and(eq(modelTags.modelId, models.id), eq(modelTags.tag, tag))),
        )
      : undefined,
  ].filter((condition) => condition !== undefined);

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, categoriesList, tagList, fileTypeList, totalRows] = await Promise.all([
    db
      .select({
        id: models.id,
        name: models.name,
        fileType: models.fileType,
        fileSize: models.fileSize,
        categoryName: categories.name,
        createdAt: models.createdAt,
        fileUrl: models.fileUrl,
      })
      .from(models)
      .leftJoin(categories, eq(models.categoryId, categories.id))
      .where(whereClause)
      .orderBy(desc(models.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.name)),
    db.selectDistinct({ tag: modelTags.tag }).from(modelTags).orderBy(asc(modelTags.tag)),
    db.selectDistinct({ fileType: models.fileType }).from(models).orderBy(asc(models.fileType)),
    db.select({ count: sql<number>`count(*)` }).from(models).where(whereClause),
  ]);

  const total = totalRows[0]?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return data({
    items,
    categories: categoriesList,
    tags: tagList.map((entry) => entry.tag),
    fileTypes: fileTypeList.map((entry) => entry.fileType),
    page,
    totalPages,
    filters: {
      q: q ?? '',
      categoryId: parsed.categoryId ?? '',
      tag: tag ?? '',
      fileType: fileType ?? '',
    },
  });
}

export default function ModelsRoute() {
  const { items, categories, tags, fileTypes, page, totalPages, filters } = useLoaderData<typeof loader>();

  const createPageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.categoryId) params.set('categoryId', String(filters.categoryId));
    if (filters.tag) params.set('tag', filters.tag);
    if (filters.fileType) params.set('fileType', filters.fileType);
    params.set('page', String(nextPage));
    return `/models?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">모델 목록</h1>
        <Link to="/models/upload" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          모델 업로드
        </Link>
      </div>

      <Form method="get" className="grid grid-cols-1 gap-3 rounded-lg border p-4 md:grid-cols-4">
        <input
          type="text"
          name="q"
          defaultValue={filters.q}
          placeholder="모델명 또는 설명 검색"
          className="h-10 rounded-md border px-3"
        />
        <select name="categoryId" defaultValue={filters.categoryId} className="h-10 rounded-md border px-3">
          <option value="">모든 카테고리</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select name="fileType" defaultValue={filters.fileType} className="h-10 rounded-md border px-3">
          <option value="">모든 파일 형식</option>
          {fileTypes.map((type) => (
            <option key={type} value={type}>
              {type.toUpperCase()}
            </option>
          ))}
        </select>
        <select name="tag" defaultValue={filters.tag} className="h-10 rounded-md border px-3">
          <option value="">모든 태그</option>
          {tags.map((currentTag) => (
            <option key={currentTag} value={currentTag}>
              {currentTag}
            </option>
          ))}
        </select>
        <div className="md:col-span-4 flex justify-end">
          <button type="submit" className="rounded-md bg-secondary px-4 py-2 text-sm font-medium">
            필터 적용
          </button>
        </div>
      </Form>

      {items.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          조건에 맞는 모델이 없습니다.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((model) => (
            <ModelCard
              key={model.id}
              id={model.id}
              name={model.name}
              fileType={model.fileType}
              fileSize={model.fileSize}
              categoryName={model.categoryName}
              createdAt={model.createdAt}
              fileUrl={model.fileUrl}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        <Link
          to={page > 1 ? createPageHref(page - 1) : '#'}
          className="rounded-md border px-3 py-2 text-sm disabled:pointer-events-none"
          aria-disabled={page <= 1}
        >
          이전
        </Link>
        <span className="text-sm text-muted-foreground">
          {page} / {totalPages}
        </span>
        <Link
          to={page < totalPages ? createPageHref(page + 1) : '#'}
          className="rounded-md border px-3 py-2 text-sm"
          aria-disabled={page >= totalPages}
        >
          다음
        </Link>
      </div>
    </div>
  );
}