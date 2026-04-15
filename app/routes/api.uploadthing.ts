import { createRouteHandler } from 'uploadthing/server';
import { uploadRouter } from '~/lib/uploadthing.server';

const handler = createRouteHandler({
  router: uploadRouter,
});

export async function loader({ request }: { request: Request }) {
  return handler(request);
}

export async function action({ request }: { request: Request }) {
  return handler(request);
}
