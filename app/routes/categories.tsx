import { useState } from 'react';
import { useFetcher } from 'react-router';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { models, categories } from '~/db/schema';
import { db } from '~/lib/db.server';
import { categoryFormSchema, slugify } from '~/lib/validators';
import { count, eq } from 'drizzle-orm';
import type { Route } from './+types/categories';

type Category = typeof categories.$inferSelect;
type CategoryNode = Category & { children: CategoryNode[] };
type ActionData = { ok?: boolean; error?: string; errors?: Record<string, string[] | undefined> };

export const meta = () => [{ title: '카테고리 관리 - 3D 모델 저장소' }];

export async function loader() {
  const allCategories = await db.select().from(categories).orderBy(categories.name);
  return { categories: allCategories };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  switch (intent) {
    case 'create': {
      const parsed = categoryFormSchema.safeParse(Object.fromEntries(formData));
      if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

      await db
        .insert(categories)
        .values({
          name: parsed.data.name,
          slug: slugify(parsed.data.name),
          parentId: parsed.data.parentId ?? null,
        });
      return { ok: true };
    }
    case 'rename': {
      const id = Number(formData.get('id'));
      const parsed = categoryFormSchema.safeParse({ name: formData.get('name') });
      if (!id) return { error: '잘못된 요청입니다' };
      if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

      await db
        .update(categories)
        .set({
          name: parsed.data.name,
          slug: slugify(parsed.data.name),
        })
        .where(eq(categories.id, id));
      return { ok: true };
    }
    case 'delete': {
      const id = Number(formData.get('id'));
      if (!id) return { error: '잘못된 요청입니다' };

      const relatedModels = (await db
        .select({ value: count() })
        .from(models)
        .where(eq(models.categoryId, id)))[0];

      if ((relatedModels?.value ?? 0) > 0) {
        return { error: '해당 카테고리에 모델이 존재합니다' };
      }

      await db.delete(categories).where(eq(categories.id, id));
      return { ok: true };
    }
    default:
      return { error: '지원하지 않는 요청입니다' };
  }
}

function buildCategoryTree(list: Category[]): CategoryNode[] {
  const byId = new Map<number, CategoryNode>();
  const roots: CategoryNode[] = [];

  for (const category of list) {
    byId.set(category.id, { ...category, children: [] });
  }

  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) byId.get(node.parentId)!.children.push(node);
    else roots.push(node);
  }

  return roots;
}

function CategoryTree({
  nodes,
  editingId,
  editingName,
  onStartEdit,
  onChangeEditName,
  onCancelEdit,
  renameFetcher,
  deleteFetcher,
}: {
  nodes: CategoryNode[];
  editingId: number | null;
  editingName: string;
  onStartEdit: (id: number, name: string) => void;
  onChangeEditName: (value: string) => void;
  onCancelEdit: () => void;
  renameFetcher: ReturnType<typeof useFetcher<ActionData>>;
  deleteFetcher: ReturnType<typeof useFetcher<ActionData>>;
}) {
  if (nodes.length === 0) return null;

  return (
    <ul className="space-y-3">
      {nodes.map((node) => (
        <li key={node.id} className="rounded-md border p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="font-medium">{node.name}</div>
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onStartEdit(node.id, node.name)}>
                이름 변경
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" size="sm">
                    삭제
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>카테고리를 삭제할까요?</AlertDialogTitle>
                    <AlertDialogDescription>
                      카테고리를 삭제하면 되돌릴 수 없습니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <deleteFetcher.Form method="post">
                      <input type="hidden" name="intent" value="delete" />
                      <input type="hidden" name="id" value={node.id} />
                      <AlertDialogAction type="submit">삭제</AlertDialogAction>
                    </deleteFetcher.Form>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {editingId === node.id ? (
            <renameFetcher.Form method="post" className="mt-3 flex items-center gap-2">
              <input type="hidden" name="intent" value="rename" />
              <input type="hidden" name="id" value={node.id} />
              <Input
                name="name"
                value={editingName}
                onChange={(event) => onChangeEditName(event.target.value)}
                placeholder="카테고리명"
              />
              <Button type="submit" size="sm">
                저장
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={onCancelEdit}>
                취소
              </Button>
            </renameFetcher.Form>
          ) : null}

          {node.children.length > 0 ? (
            <Collapsible defaultOpen className="mt-3">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">하위 카테고리</Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 pl-4">
                <CategoryTree
                  nodes={node.children}
                  editingId={editingId}
                  editingName={editingName}
                  onStartEdit={onStartEdit}
                  onChangeEditName={onChangeEditName}
                  onCancelEdit={onCancelEdit}
                  renameFetcher={renameFetcher}
                  deleteFetcher={deleteFetcher}
                />
              </CollapsibleContent>
            </Collapsible>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export default function CategoriesPage({ loaderData }: Route.ComponentProps) {
  const tree = buildCategoryTree(loaderData.categories);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const createFetcher = useFetcher<ActionData>();
  const renameFetcher = useFetcher<ActionData>();
  const deleteFetcher = useFetcher<ActionData>();

  const errorMessage =
    createFetcher.data?.error ??
    renameFetcher.data?.error ??
    deleteFetcher.data?.error ??
    createFetcher.data?.errors?.name?.[0] ??
    renameFetcher.data?.errors?.name?.[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">카테고리 관리</h1>
          <p className="text-muted-foreground mt-1">카테고리를 계층 구조로 관리하세요</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>카테고리 추가</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>카테고리 추가</DialogTitle>
            </DialogHeader>
            <createFetcher.Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="create" />
              <div className="space-y-2">
                <Label htmlFor="name">카테고리명</Label>
                <Input id="name" name="name" placeholder="카테고리명을 입력하세요" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentId">상위 카테고리 (선택)</Label>
                <select
                  id="parentId"
                  name="parentId"
                  defaultValue=""
                  className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <option value="">없음</option>
                  {loaderData.categories.map((category: Category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <DialogFooter>
                <Button type="submit">저장</Button>
              </DialogFooter>
            </createFetcher.Form>
          </DialogContent>
        </Dialog>
      </div>

      {errorMessage ? <p className="text-destructive text-sm">{errorMessage}</p> : null}

      {tree.length === 0 ? (
        <div className="text-muted-foreground rounded-md border border-dashed p-8 text-center">
          등록된 카테고리가 없습니다.
        </div>
      ) : (
        <CategoryTree
          nodes={tree}
          editingId={editingId}
          editingName={editingName}
          onStartEdit={(id, name) => {
            setEditingId(id);
            setEditingName(name);
          }}
          onChangeEditName={setEditingName}
          onCancelEdit={() => {
            setEditingId(null);
            setEditingName('');
          }}
          renameFetcher={renameFetcher}
          deleteFetcher={deleteFetcher}
        />
      )}
    </div>
  );
}