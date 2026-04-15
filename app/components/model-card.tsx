import { lazy, Suspense } from 'react';
import { Link } from 'react-router';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

const ModelViewer = lazy(() => import('~/components/model-viewer'));
type ModelCardProps = {
  id: string;
  name: string;
  fileType: string;
  fileSize: number;
  categoryName: string | null;
  createdAt: Date | number | string;
  fileUrl: string | null;
};
function formatFileSize(bytes: number) {
  const mb = bytes / 1024 / 1024;
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(2)} KB`;
}

export function ModelCard({ id, name, fileType, fileSize, categoryName, createdAt, fileUrl }: ModelCardProps) {
  const date = new Date(createdAt).toLocaleDateString('ko-KR');
  const normalizedFileType = fileType.toLowerCase();
  const canPreview = ['stl', 'gltf', 'glb', 'step', 'stp'].includes(normalizedFileType);
  const previewUrl = fileUrl || `/api/models/${id}/file`;

  return (
    <Link to={`/models/${id}`} className='block'>
      <Card className='flex flex-row items-stretch transition-colors hover:border-foreground/40'>
        <div className='flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-l-lg border-r bg-muted/30'>
          {canPreview ? (
            <Suspense fallback={<div className='h-full w-full animate-pulse rounded-l-lg bg-muted' />}>
              <ModelViewer url={previewUrl} fileType={normalizedFileType} />
            </Suspense>
          ) : (
            <div className='flex h-full w-full items-center justify-center text-xs text-muted-foreground'>
              <span>미리보기 없음</span>
            </div>
          )}
        </div>
        <div className='flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-3'>
          <div className='flex items-center gap-2'>
            <Badge variant='secondary'>{fileType.toUpperCase()}</Badge>
            {categoryName ? <Badge variant='outline'>{categoryName}</Badge> : null}
          </div>
          <h3 className='truncate text-base font-semibold'>{name}</h3>
          <div className='flex gap-4 text-sm text-muted-foreground'>
            <span>파일 크기: {formatFileSize(fileSize)}</span>
            <span>업로드일: {date}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default ModelCard;
