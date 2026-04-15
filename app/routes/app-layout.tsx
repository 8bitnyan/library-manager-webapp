import { Outlet } from 'react-router';
import { SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar';
import { AppSidebar } from '~/components/layout/app-sidebar';
import { requireSession } from '~/lib/session.server';
import type { Route } from './+types/app-layout';

export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireSession(request);
  return { user: session.user };
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  return (
    <SidebarProvider>
      <AppSidebar user={loaderData.user} />
      <main className="flex-1 overflow-auto">
        <div className="flex items-center gap-2 border-b p-4">
          <SidebarTrigger />
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
