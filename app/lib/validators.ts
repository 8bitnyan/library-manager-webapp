import { z } from 'zod';

const ALLOWED_FILE_TYPES = ['stl', 'gltf', 'glb', 'obj', 'fbx', 'step', 'stp'] as const;
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const modelFormSchema = z.object({
  name: z.string().min(1, '모델 이름을 입력해주세요'),
  description: z.string().optional(),
  categoryId: z.coerce.number().optional().nullable(),
  tags: z.string().optional(),
});

export const uploadFormSchema = z.object({
  name: z.string().min(1, '모델 이름을 입력해주세요'),
  description: z.string().optional(),
  categoryId: z.coerce.number().optional().nullable(),
  tags: z.string().optional(),
});

export const categoryFormSchema = z.object({
  name: z.string().min(1, '카테고리명을 입력해주세요'),
  parentId: z.preprocess((val) => (val === '' || val === null || val === undefined ? null : Number(val)), z.number().nullable().optional()),
});

export const searchParamsSchema = z.object({
  q: z.string().optional(),
  categoryId: z.coerce.number().optional(),
  tag: z.string().optional(),
  fileType: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w가-힣-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || `cat-${Date.now()}`;
}

export { ALLOWED_FILE_TYPES, MAX_FILE_SIZE };