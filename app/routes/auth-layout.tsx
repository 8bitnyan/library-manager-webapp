import { Outlet, redirect } from 'react-router';
import { getSession } from '~/lib/session.server';
import type { Route } from './+types/auth-layout';

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request);
  if (session) throw redirect('/');
  return {};
}

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">3D 모델 저장소</h1>
        <p className="text-muted-foreground mt-2">3D Model Storage</p>
      </div>
      <Outlet />
    </div>
  );
}