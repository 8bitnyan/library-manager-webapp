import { eq } from 'drizzle-orm';
import { db } from '~/lib/db.server';
import { getMimeType, readModelFile } from '~/lib/storage.server';
import { models } from '~/db/schema';
import type { Route } from './+types/api.models.$id.file';

export async function loader({ request, params }: Route.LoaderArgs) {
  const id = params.id;
  if (!id) {
    throw new Response('모델을 찾을 수 없습니다.', { status: 404 });
  }

  const model = (await db
    .select({ fileName: models.fileName, fileType: models.fileType })
    .from(models)
    .where(eq(models.id, id)))[0];

  if (!model) {
    throw new Response('모델을 찾을 수 없습니다.', { status: 404 });
  }

  let fileBuffer: Buffer;
  try {
    fileBuffer = readModelFile(id, model.fileName);
  } catch {
    throw new Response('파일을 찾을 수 없습니다.', { status: 404 });
  }

  const url = new URL(request.url);
  const isDownload = url.searchParams.get('download') === '1';
  const dispositionType = isDownload ? 'attachment' : 'inline';
  const encodedFileName = encodeURIComponent(model.fileName);

  return new Response(new Uint8Array(fileBuffer), {
    headers: {
      'Content-Type': getMimeType(model.fileType),
      'Content-Length': String(fileBuffer.byteLength),
      'Content-Disposition': `${dispositionType}; filename*=UTF-8''${encodedFileName}`,
    },
  });
}