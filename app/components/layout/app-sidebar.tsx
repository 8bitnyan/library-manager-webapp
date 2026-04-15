import { Link, useLocation, useNavigate } from 'react-router';
import { Box, FolderTree, LayoutDashboard, LogOut, Upload } from 'lucide-react';
import { authClient } from '~/lib/auth-client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar';
import { Button } from '~/components/ui/button';

const navItems = [
  { label: '대시보드', href: '/', icon: LayoutDashboard },
  { label: '모델 목록', href: '/models', icon: Box },
  { label: '모델 업로드', href: '/models/upload', icon: Upload },
  { label: '카테고리', href: '/categories', icon: FolderTree },
];

export function AppSidebar({ user }: { user: { name?: string | null; email: string } }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authClient.signOut();
    navigate('/login');
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-bold">3D 모델 저장소</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      location.pathname === item.href ||
                      (item.href !== '/' && location.pathname.startsWith(item.href))
                    }
                  >
                    <Link to={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="text-muted-foreground mb-2 truncate text-sm">{user.name || user.email}</div>
        <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 size-4" />
          로그아웃
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
