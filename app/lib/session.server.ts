import { redirect } from 'react-router';
import { auth } from '~/lib/auth.server';

export async function getSession(request: Request) {
  return await auth.api.getSession({ headers: request.headers });
}

export async function requireSession(request: Request) {
  const session = await getSession(request);
  if (!session) {
    throw redirect('/login');
  }
  return session;
}
