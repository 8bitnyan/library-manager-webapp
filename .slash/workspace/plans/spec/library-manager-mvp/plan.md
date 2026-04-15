---
created: 2026-04-13T00:00:00Z
last_updated: 2026-04-13T00:00:00Z
type: spec
change_id: library-manager-mvp
status: pending
trigger: "Create book/media library management system with categories, tags, borrowing, search, and dashboard — Korean UI, Better Auth as-is"
---

# Plan: Book Library Manager MVP (도서관 관리 시스템)

## Background & Research

### Project Location
All file paths are relative to: `/Users/8bitnyan/Documents/ThinkTank/davinci_beta/library-manager-webapp/`

### Domain
This is a **book/media library management** system — NOT a 3D model library. The domain entities are:
- **Books** (도서): title, author, ISBN, publisher, publishedDate, description, coverImageUrl, categoryId
- **Categories** (카테고리): hierarchical tree with parentId self-reference
- **Tags** (태그): many-to-many relationship via `book_tags` junction table
- **Borrowings** (대출): borrowedAt, dueDate (14 days), returnedAt, status (borrowed/returned/overdue)

### Tech Stack (Already Configured)
- React Router v7 (framework mode, SSR, loaders/actions, middleware)
- Drizzle ORM + bun:sqlite (WAL mode, foreign keys ON)
- Better Auth (email/password + optional GitHub OAuth) — **DO NOT CHANGE**
- Shadcn UI (radix-nova style) + Tailwind CSS v4
- Vite + Vitest
- Bun runtime, package manager: bun
- zod, date-fns, lucide-react, recharts — all already installed

### Existing Schema (`app/db/schema.ts` lines 1-117)
```ts
import { relations, sql } from 'drizzle-orm';
import { index, sqliteTable } from 'drizzle-orm/sqlite-core';

// DELETE this table (todo app boilerplate)
export const todos = sqliteTable('todo', (d) => ({
  id: d.integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  text: d.text({ length: 256 }).notNull(),
  completed: d.integer({ mode: 'number' }).default(0).notNull(),
  createdAt: d.integer({ mode: 'number' }).default(sql`(unixepoch())`).notNull(),
}));

// KEEP all auth tables exactly as-is:
export const user = sqliteTable('user', (d) => ({
  id: d.text({ length: 255 }).notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: d.text({ length: 255 }),
  email: d.text({ length: 255 }).notNull().unique(),
  emailVerified: d.integer({ mode: 'boolean' }).default(false),
  image: d.text({ length: 255 }),
  createdAt: d.integer({ mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: d.integer({ mode: 'timestamp' }).$onUpdate(() => new Date()),
}));
// ... account, session, verification tables + relations (KEEP ALL)
```

### Existing Routes (`app/routes.ts`)
```ts
import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/_index.tsx'),
  route('api/auth/*', 'routes/api.auth.$.ts'),
] satisfies RouteConfig;
```

### Existing Auth Server (`app/lib/auth.server.ts`)
```ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '~/lib/db.server';
import { getBetterAuthTrustedOrigins } from '~/lib/trusted-origins.server';

export const auth = betterAuth({
  trustedOrigins: getBetterAuthTrustedOrigins(),
  database: drizzleAdapter(db, { provider: 'sqlite' }),
  emailAndPassword: { enabled: true },
  ...(process.env.BETTER_AUTH_GITHUB_CLIENT_ID &&
  process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET
    ? { socialProviders: { github: { clientId: process.env.BETTER_AUTH_GITHUB_CLIENT_ID, clientSecret: process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET } } }
    : {}),
});
export type Session = typeof auth.$Infer.Session;
```

### Existing Auth Client (`app/lib/auth-client.ts`)
```ts
import { createAuthClient } from 'better-auth/react';
export const authClient = createAuthClient();
export type Session = typeof authClient.$Infer.Session;
```

### Existing DB Connection (`app/lib/db.server.ts`)
```ts
import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from '~/db/schema';

const databasePath = process.env.DATABASE_URL ?? 'sqlite.db';
const sqlite = new Database(databasePath, { create: true });
sqlite.exec('PRAGMA journal_mode = WAL;');
sqlite.exec('PRAGMA foreign_keys = ON;');
export const db = drizzle(sqlite, { schema });
```

### Existing Root Layout (`app/root.tsx`)
```tsx
// Key parts to modify:
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"> {/* CHANGE TO lang="ko" */}
      <head>...</head>
      <body className="bg-background text-foreground antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

### Existing Auth API Route (`app/routes/api.auth.$.ts`) — **KEEP AS-IS**
```ts
import { auth } from '~/lib/auth.server';
import type { Route } from './+types/api.auth.$';
export async function loader({ request }: Route.LoaderArgs) { return auth.handler(request); }
export async function action({ request }: Route.ActionArgs) { return auth.handler(request); }
```

### React Router Config (`react-router.config.ts`)
```ts
import type { Config } from '@react-router/dev/config';
export default {
  ssr: true,
  allowedActionOrigins: ['**'],
  future: { v8_middleware: true },
} satisfies Config;
```

### Existing Index Route Pattern (`app/routes/_index.tsx`)
```tsx
// Pattern to follow for all routes:
import type { Route } from './+types/_index';

export function loader() {
  const allTodos = db.select().from(todos).orderBy(desc(todos.createdAt)).all();
  return { todos: allTodos };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');
  switch (intent) { /* handle intents */ }
  return { ok: true };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  // ... component using shadcn UI
}
```

### Available Shadcn Components (54 total)
accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button,
button-group, calendar, card, carousel, chart, checkbox, collapsible, combobox,
command, context-menu, dialog, direction, drawer, dropdown-menu, empty, field,
hover-card, input, input-group, input-otp, item, kbd, label, menubar, native-select,
navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area,
select, separator, sheet, sidebar, skeleton, slider, sonner, spinner, switch, table,
tabs, textarea, toggle, toggle-group, tooltip

### Korean UI Labels Reference
| English | Korean |
|---------|--------|
| Dashboard | 대시보드 |
| Book Management | 도서 관리 |
| Book List | 도서 목록 |
| Add Book | 도서 등록 |
| Edit Book | 도서 수정 |
| Book Detail | 도서 상세 |
| Categories | 카테고리 |
| Tags | 태그 |
| Borrowing Management | 대출 관리 |
| New Borrowing | 대출 등록 |
| Return | 반납 |
| Search | 검색 |
| Login | 로그인 |
| Sign Up | 회원가입 |
| Logout | 로그아웃 |
| Title | 제목 |
| Author | 저자 |
| Publisher | 출판사 |
| Published Date | 출판일 |
| Description | 설명 |
| Cover Image URL | 표지 이미지 URL |
| Borrower | 대출자 |
| Borrow Date | 대출일 |
| Due Date | 반납 예정일 |
| Return Date | 반납일 |
| Status | 상태 |
| Borrowed | 대출중 |
| Returned | 반납완료 |
| Overdue | 연체 |
| Save | 저장 |
| Cancel | 취소 |
| Delete | 삭제 |
| Edit | 수정 |
| Create | 생성 |
| Confirm | 확인 |
| Total Books | 총 도서 수 |
| Currently Borrowed | 현재 대출중 |
| Overdue Books | 연체 도서 |
| Recent Additions | 최근 등록 도서 |

---

## Testing Plan (TDD — tests first)

### Test Infrastructure
- [ ] T1: Create `tests/setup.ts` — test setup file that creates an in-memory SQLite DB with all schema tables, exports test `db` instance and `cleanup` helper
- [ ] T2: Create `tests/helpers.ts` — factory functions: `createTestCategory()`, `createTestBook()`, `createTestTag()`, `createTestBorrowing()` that insert test data into the test DB

### Validator Tests
- [ ] T3: Create `tests/unit/validators.test.ts` — test all zod schemas: `bookSchema` (valid/invalid title, author, ISBN format), `categorySchema` (valid/invalid name, slug generation), `borrowingSchema` (valid/invalid borrowerName, dates), `searchSchema` (valid query params)

### Schema & DB Operation Tests
- [ ] T4: Create `tests/unit/schema.test.ts` — verify all tables exist (categories, books, tags, bookTags, borrowings), verify FK constraints work (insert book with invalid categoryId fails), verify cascade deletes (delete category cascades to books, delete book cascades to bookTags)
- [ ] T5: Create `tests/unit/categories.test.ts` — test category CRUD: create root category, create child category, list categories as tree, rename category, delete category with children, delete empty category
- [ ] T6: Create `tests/unit/books.test.ts` — test book CRUD: create book with category, update book, delete book (cascades bookTags), list books with filters (by category, by search term), list books with tag filters, pagination
- [ ] T7: Create `tests/unit/borrowings.test.ts` — test borrowing operations: create borrowing (sets dueDate to +14 days), return book (sets returnedAt, status='returned'), list overdue borrowings, prevent double-borrowing of same book

---

## Implementation Plan

### Phase 1: Foundation (Schema + Auth UI + Layout)

#### Schema & Data Layer
- [ ] P1-1: Modify `app/db/schema.ts` — remove `todos` table; add `categories` table (id, name, slug, parentId self-ref, createdAt, updatedAt) with `category_parent_id_idx` index; add `books` table (id, title, author, isbn, publisher, publishedDate, description, coverImageUrl, categoryId FK, createdAt, updatedAt) with indexes on categoryId, title, isbn; add `tags` table (id, name unique); add `bookTags` junction table (bookId FK, tagId FK, composite PK) with index on tagId; add `borrowings` table (id, bookId FK, borrowerName, borrowerContact, borrowedAt, dueDate, returnedAt, status enum, createdAt) with indexes on bookId, status; add all Drizzle relations (categoryRelations with self-ref parent/children, bookRelations, tagRelations, bookTagRelations, borrowingRelations). Import `AnySQLiteColumn` and `primaryKey` from `drizzle-orm/sqlite-core`.

Schema code reference for `categories` (self-referencing FK pattern):
```ts
import { relations, sql } from 'drizzle-orm';
import { type AnySQLiteColumn, index, primaryKey, sqliteTable } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('category', (d) => ({
  id: d.integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: d.text({ length: 255 }).notNull(),
  slug: d.text({ length: 255 }).notNull(),
  parentId: d.integer({ mode: 'number' }).references((): AnySQLiteColumn => categories.id, { onDelete: 'set null' }),
  createdAt: d.integer({ mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: d.integer({ mode: 'timestamp' }).$onUpdate(() => new Date()),
}), (t) => [
  index('category_parent_id_idx').on(t.parentId),
]);
```

Schema code reference for `books`:
```ts
export const books = sqliteTable('book', (d) => ({
  id: d.integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  title: d.text({ length: 500 }).notNull(),
  author: d.text({ length: 255 }).notNull(),
  isbn: d.text({ length: 20 }),
  publisher: d.text({ length: 255 }),
  publishedDate: d.text({ length: 10 }),
  description: d.text(),
  coverImageUrl: d.text({ length: 500 }),
  categoryId: d.integer({ mode: 'number' }).notNull().references(() => categories.id),
  createdAt: d.integer({ mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: d.integer({ mode: 'timestamp' }).$onUpdate(() => new Date()),
}), (t) => [
  index('book_category_id_idx').on(t.categoryId),
  index('book_title_idx').on(t.title),
  index('book_isbn_idx').on(t.isbn),
]);
```

Schema code reference for `tags` + `bookTags`:
```ts
export const tags = sqliteTable('tag', (d) => ({
  id: d.integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: d.text({ length: 100 }).notNull().unique(),
}));

export const bookTags = sqliteTable('book_tag', (d) => ({
  bookId: d.integer({ mode: 'number' }).notNull().references(() => books.id, { onDelete: 'cascade' }),
  tagId: d.integer({ mode: 'number' }).notNull().references(() => tags.id, { onDelete: 'cascade' }),
}), (t) => [
  primaryKey({ columns: [t.bookId, t.tagId] }),
  index('book_tag_tag_id_idx').on(t.tagId),
]);
```

Schema code reference for `borrowings`:
```ts
export const borrowings = sqliteTable('borrowing', (d) => ({
  id: d.integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  bookId: d.integer({ mode: 'number' }).notNull().references(() => books.id),
  borrowerName: d.text({ length: 255 }).notNull(),
  borrowerContact: d.text({ length: 255 }),
  borrowedAt: d.integer({ mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  dueDate: d.integer({ mode: 'timestamp' }).notNull(),
  returnedAt: d.integer({ mode: 'timestamp' }),
  status: d.text({ length: 20, enum: ['borrowed', 'returned', 'overdue'] }).notNull().default('borrowed'),
  createdAt: d.integer({ mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
}), (t) => [
  index('borrowing_book_id_idx').on(t.bookId),
  index('borrowing_status_idx').on(t.status),
]);
```

Relations code reference:
```ts
export const categoryRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id], relationName: 'categoryParent' }),
  children: many(categories, { relationName: 'categoryParent' }),
  books: many(books),
}));

export const bookRelations = relations(books, ({ one, many }) => ({
  category: one(categories, { fields: [books.categoryId], references: [categories.id] }),
  bookTags: many(bookTags),
  borrowings: many(borrowings),
}));

export const tagRelations = relations(tags, ({ many }) => ({
  bookTags: many(bookTags),
}));

export const bookTagRelations = relations(bookTags, ({ one }) => ({
  book: one(books, { fields: [bookTags.bookId], references: [books.id] }),
  tag: one(tags, { fields: [bookTags.tagId], references: [tags.id] }),
}));

export const borrowingRelations = relations(borrowings, ({ one }) => ({
  book: one(books, { fields: [borrowings.bookId], references: [books.id] }),
}));
```

- [ ] P1-2: Create `app/lib/validators.ts` — zod schemas for all form inputs: `bookFormSchema` (title: min 1, author: min 1, isbn: optional regex `^\d{10,13}$`, publisher: optional, publishedDate: optional date string, description: optional, coverImageUrl: optional url, categoryId: number), `categoryFormSchema` (name: min 1, parentId: optional number), `borrowingFormSchema` (bookId: number, borrowerName: min 1, borrowerContact: optional), `searchParamsSchema` (q: optional string, categoryId: optional number, tagId: optional number, page: optional number default 1, limit: optional number default 20). Export a `slugify` helper function (Korean-safe: replace spaces with hyphens, lowercase, remove special chars, fallback to timestamp if empty).

```ts
import { z } from 'zod';

export const bookFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  author: z.string().min(1, '저자를 입력해주세요'),
  isbn: z.string().regex(/^\d{10,13}$/, 'ISBN은 10-13자리 숫자입니다').optional().or(z.literal('')),
  publisher: z.string().optional(),
  publishedDate: z.string().optional(),
  description: z.string().optional(),
  coverImageUrl: z.string().url('올바른 URL을 입력해주세요').optional().or(z.literal('')),
  categoryId: z.coerce.number({ required_error: '카테고리를 선택해주세요' }),
  tags: z.string().optional(), // comma-separated tag names
});

export const categoryFormSchema = z.object({
  name: z.string().min(1, '카테고리명을 입력해주세요'),
  parentId: z.coerce.number().optional().nullable(),
});

export const borrowingFormSchema = z.object({
  bookId: z.coerce.number({ required_error: '도서를 선택해주세요' }),
  borrowerName: z.string().min(1, '대출자명을 입력해주세요'),
  borrowerContact: z.string().optional(),
});

export const searchParamsSchema = z.object({
  q: z.string().optional(),
  categoryId: z.coerce.number().optional(),
  tagId: z.coerce.number().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

export function slugify(text: string): string {
  const slug = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w가-힣-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return slug || `cat-${Date.now()}`;
}
```

- [ ] P1-3: Run `bun run db:generate && bun run db:push` to apply schema changes to SQLite

#### Session Helper
- [ ] P1-4: Create `app/lib/session.server.ts` — export `getSession(request: Request)` that calls `auth.api.getSession({ headers: request.headers })` and returns the session or null; export `requireSession(request: Request)` that calls `getSession` and throws `redirect('/login')` if null, otherwise returns the session object.

```ts
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
```

#### Root & Routes Config
- [ ] P1-5: Modify `app/root.tsx` — change `<html lang="en">` to `<html lang="ko">`, add `<Toaster />` from sonner inside `<body>` (import from `~/components/ui/sonner`).

```tsx
// Add import at top:
import { Toaster } from '~/components/ui/sonner';

// In Layout component, change:
<html lang="ko">
  {/* ... */}
  <body className="bg-background text-foreground antialiased">
    {children}
    <Toaster richColors position="top-right" />
    <ScrollRestoration />
    <Scripts />
  </body>
</html>
```

- [ ] P1-6: Rewrite `app/routes.ts` — import `layout` from `@react-router/dev/routes`; define auth layout group (login, signup), app layout group (index=dashboard, books/*, categories, borrowings/*), keep api/auth/* route.

```ts
import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

export default [
  layout('routes/auth-layout.tsx', [
    route('login', 'routes/login.tsx'),
    route('signup', 'routes/signup.tsx'),
  ]),

  layout('routes/app-layout.tsx', [
    index('routes/dashboard.tsx'),
    route('books', 'routes/books.tsx'),
    route('books/new', 'routes/books-new.tsx'),
    route('books/:id', 'routes/book-detail.tsx'),
    route('books/:id/edit', 'routes/book-edit.tsx'),
    route('categories', 'routes/categories.tsx'),
    route('borrowings', 'routes/borrowings.tsx'),
    route('borrowings/new', 'routes/borrowings-new.tsx'),
  ]),

  route('api/auth/*', 'routes/api.auth.$.ts'),
] satisfies RouteConfig;
```

- [ ] P1-7: Delete `app/routes/_index.tsx` (old todo app route — replaced by dashboard inside app layout)

#### Auth Pages (Better Auth Client — email/password)
- [ ] P1-8: Create `app/routes/auth-layout.tsx` — layout route for login/signup; loader checks session via `getSession(request)`, if authenticated redirects to `/`; renders centered `<Outlet />` with card-style container, app title "도서관 관리 시스템" at top.

```tsx
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
        <h1 className="text-3xl font-bold">도서관 관리 시스템</h1>
        <p className="text-muted-foreground mt-2">Library Management System</p>
      </div>
      <Outlet />
    </div>
  );
}
```

- [ ] P1-9: Create `app/routes/login.tsx` — login page using Better Auth client; form with email + password inputs; on submit call `authClient.signIn.email({ email, password })`; on success navigate to `/`; show error toast on failure; link to signup page. All labels in Korean.

```tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { authClient } from '~/lib/auth-client';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { toast } from 'sonner';

export const meta = () => [{ title: '로그인 - 도서관 관리' }];

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (error) {
      toast.error('로그인 실패', { description: error.message });
    } else {
      navigate('/');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>로그인</CardTitle>
        <CardDescription>이메일과 비밀번호를 입력해주세요</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </Button>
          <p className="text-muted-foreground text-sm">
            계정이 없으신가요? <Link to="/signup" className="text-primary underline">회원가입</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
```

- [ ] P1-10: Create `app/routes/signup.tsx` — signup page using Better Auth client; form with name + email + password + password confirm inputs; on submit call `authClient.signUp.email({ name, email, password })`; on success navigate to `/`; show error toast on failure; link to login page. All labels in Korean.

#### App Layout & Sidebar
- [ ] P1-11: Create `app/components/layout/app-sidebar.tsx` — sidebar component using shadcn `Sidebar`, `SidebarContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, etc.; nav items: 대시보드 (LayoutDashboard icon, href="/"), 도서 관리 (BookOpen icon, href="/books"), 카테고리 (FolderTree icon, href="/categories"), 대출 관리 (BookCopy icon, href="/borrowings"); footer with user email display and logout button (calls `authClient.signOut()`). Accept `user` prop with `{ name, email }`.

```tsx
import { Link, useLocation, useNavigate } from 'react-router';
import { BookCopy, BookOpen, FolderTree, LayoutDashboard, LogOut } from 'lucide-react';
import { authClient } from '~/lib/auth-client';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from '~/components/ui/sidebar';
import { Button } from '~/components/ui/button';

const navItems = [
  { label: '대시보드', href: '/', icon: LayoutDashboard },
  { label: '도서 관리', href: '/books', icon: BookOpen },
  { label: '카테고리', href: '/categories', icon: FolderTree },
  { label: '대출 관리', href: '/borrowings', icon: BookCopy },
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
        <h2 className="text-lg font-bold">도서관 관리</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))}>
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
```

- [ ] P1-12: Create `app/routes/app-layout.tsx` — protected layout route; loader calls `requireSession(request)` and returns `{ user: session.user }`; renders `<SidebarProvider>` + `<AppSidebar user={user} />` + `<main className="flex-1 overflow-auto"><Outlet /></main>`.

```tsx
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
```

- [ ] P1-13: Create `app/routes/dashboard.tsx` — skeleton dashboard page (placeholder); loader returns empty stats for now; renders heading "대시보드" and placeholder cards. Full implementation in Phase 3.

```tsx
import type { Route } from './+types/dashboard';

export const meta = () => [{ title: '대시보드 - 도서관 관리' }];

export function loader() {
  return { stats: { totalBooks: 0, borrowed: 0, overdue: 0, categories: 0 } };
}

export default function DashboardPage({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold">대시보드</h1>
      <p className="text-muted-foreground mt-1">도서관 현황을 한눈에 확인하세요</p>
      {/* Full dashboard UI added in Phase 3 */}
    </div>
  );
}
```

### Phase 2: Category CRUD + Book CRUD (with Tags)

#### Category Management
- [ ] P2-1: Create `app/routes/categories.tsx` — full category management page; loader queries all categories with parent relations ordered by name; action handles intents: `create` (insert category with name, slug=slugify(name), parentId), `rename` (update category name + slug), `delete` (delete category by id); UI renders a tree view of categories using collapsible components, each node has edit/delete buttons; includes an "add category" dialog with name input and optional parent select dropdown. All labels Korean.

Loader pattern:
```ts
export function loader() {
  const allCategories = db.select().from(categories).orderBy(categories.name).all();
  return { categories: allCategories };
}
```

Action pattern:
```ts
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');
  switch (intent) {
    case 'create': {
      const parsed = categoryFormSchema.safeParse(Object.fromEntries(formData));
      if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
      db.insert(categories).values({
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        parentId: parsed.data.parentId ?? null,
      }).run();
      break;
    }
    case 'rename': { /* update name + slug */ break; }
    case 'delete': { /* delete by id */ break; }
  }
  return { ok: true };
}
```

#### Book Management
- [ ] P2-2: Create `app/components/books/book-form.tsx` — reusable book form component used by both new and edit pages; props: `defaultValues?`, `categories` (for select), `allTags` (for suggestions), `action` (form action URL), `submitLabel`; renders form with: title input, author input, isbn input, publisher input, publishedDate input (date picker or text), description textarea, coverImageUrl input, categoryId select dropdown, tags input (comma-separated text with existing tag suggestions). All labels Korean. Uses shadcn Input, Select, Textarea, Button, Label components.

- [ ] P2-3: Create `app/routes/books.tsx` — book list page; loader accepts searchParams (q, categoryId, tagId, page), queries books with category relation and bookTags, applies filters using Drizzle `where` + `like` for search, returns paginated results + all categories (for filter dropdown) + all tags (for filter); UI renders: search bar with filter controls, book table/card grid showing title/author/category/tags/status, pagination, "도서 등록" button linking to `/books/new`. All Korean.

Loader pattern for filtered book listing:
```ts
export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const params = searchParamsSchema.parse(Object.fromEntries(url.searchParams));
  
  let query = db.select().from(books)
    .leftJoin(categories, eq(books.categoryId, categories.id))
    .orderBy(desc(books.createdAt));

  if (params.q) {
    query = query.where(or(
      like(books.title, `%${params.q}%`),
      like(books.author, `%${params.q}%`),
      like(books.isbn, `%${params.q}%`),
    ));
  }
  if (params.categoryId) {
    query = query.where(eq(books.categoryId, params.categoryId));
  }

  const offset = (params.page - 1) * params.limit;
  const results = query.limit(params.limit).offset(offset).all();
  
  // Also fetch tags for each book
  const allCategories = db.select().from(categories).orderBy(categories.name).all();
  const allTags = db.select().from(tags).orderBy(tags.name).all();
  
  return { books: results, categories: allCategories, tags: allTags, params };
}
```

- [ ] P2-4: Create `app/routes/books-new.tsx` — add book page; loader returns all categories + all tags for the form; action validates with `bookFormSchema`, inserts book into `books` table, handles tags (for each comma-separated tag: find-or-create in `tags` table, insert into `bookTags`), redirects to `/books/:id` on success. Uses `BookForm` component. Meta title: "도서 등록 - 도서관 관리".

Action tag handling pattern:
```ts
// Inside action after inserting book:
const tagNames = parsed.data.tags?.split(',').map(t => t.trim()).filter(Boolean) ?? [];
for (const tagName of tagNames) {
  let tag = db.select().from(tags).where(eq(tags.name, tagName)).get();
  if (!tag) {
    const result = db.insert(tags).values({ name: tagName }).returning().get();
    tag = result;
  }
  db.insert(bookTags).values({ bookId: newBook.id, tagId: tag.id }).run();
}
```

- [ ] P2-5: Create `app/routes/book-detail.tsx` — book detail page; loader gets book by `:id` param with category + bookTags + tags relations, also fetches active borrowings for the book; throws 404 if not found; action handles `delete` intent (deletes book + cascaded bookTags, redirects to `/books`); UI renders: book cover image (if URL provided), title, author, ISBN, publisher, published date, description, category badge, tag badges, borrowing status indicator, edit button (link to `/books/:id/edit`), delete button with confirmation dialog, "대출 등록" button linking to `/borrowings/new?bookId=:id`. All Korean.

- [ ] P2-6: Create `app/routes/book-edit.tsx` — edit book page; loader gets book by `:id` with existing tags, returns book + all categories + all tags; action validates with `bookFormSchema`, updates book, syncs tags (delete all existing bookTags for this book, re-insert from form), redirects to `/books/:id` on success. Uses `BookForm` component with `defaultValues`. Meta title: "도서 수정 - 도서관 관리".

### Phase 3: Borrowing System + Search Enhancement + Dashboard

#### Borrowing System
- [ ] P3-1: Create `app/routes/borrowings.tsx` — borrowing list page; loader queries all borrowings with book relation, supports filter by status (borrowed/returned/overdue) via searchParams; also runs an overdue check: update any borrowing where `status='borrowed'` AND `dueDate < now` to `status='overdue'`; UI renders: filter tabs (전체/대출중/반납완료/연체), borrowing table with columns (도서명, 대출자, 대출일, 반납예정일, 반납일, 상태), status badges (color-coded: blue=대출중, green=반납완료, red=연체), "반납" action button on active borrowings, "대출 등록" button linking to `/borrowings/new`. All Korean.

Overdue check pattern (run in loader):
```ts
const now = new Date();
db.update(borrowings)
  .set({ status: 'overdue' })
  .where(and(
    eq(borrowings.status, 'borrowed'),
    lt(borrowings.dueDate, now),
  ))
  .run();
```

Action for return:
```ts
case 'return': {
  const id = Number(formData.get('id'));
  db.update(borrowings)
    .set({ status: 'returned', returnedAt: new Date() })
    .where(eq(borrowings.id, id))
    .run();
  break;
}
```

- [ ] P3-2: Create `app/routes/borrowings-new.tsx` — new borrowing page; loader returns all books (only those not currently borrowed — left join borrowings where status='borrowed' and filter out), accepts optional `bookId` searchParam to pre-select; action validates with `borrowingFormSchema`, calculates dueDate as `borrowedAt + 14 days` using `date-fns/addDays`, inserts borrowing, redirects to `/borrowings`. UI renders: book select dropdown (searchable combobox showing title + author), borrowerName input, borrowerContact input, submit button. All Korean.

```ts
import { addDays } from 'date-fns';

// In action:
const now = new Date();
db.insert(borrowings).values({
  bookId: parsed.data.bookId,
  borrowerName: parsed.data.borrowerName,
  borrowerContact: parsed.data.borrowerContact || null,
  borrowedAt: now,
  dueDate: addDays(now, 14),
  status: 'borrowed',
}).run();
```

#### Dashboard (Full Implementation)
- [ ] P3-3: Create `app/components/dashboard/stats-cards.tsx` — 4 stat cards component: 총 도서 수 (BookOpen icon), 현재 대출중 (BookCopy icon), 연체 도서 (AlertTriangle icon), 카테고리 수 (FolderTree icon); each card shows count with label. Uses shadcn Card components.

- [ ] P3-4: Create `app/components/dashboard/recent-books.tsx` — recent books list component showing last 5 books added (title, author, date); uses shadcn Table.

- [ ] P3-5: Create `app/components/dashboard/overdue-list.tsx` — overdue borrowings list component showing all overdue items (book title, borrower, days overdue); uses shadcn Table with red status badges.

- [ ] P3-6: Create `app/components/dashboard/category-chart.tsx` — bar chart showing book count per category; uses recharts BarChart (already installed).

- [ ] P3-7: Update `app/routes/dashboard.tsx` — full dashboard implementation; loader queries: total books count, active borrowings count (status='borrowed'), overdue count (status='overdue'), category count, last 5 books with category, all overdue borrowings with book info, book counts grouped by category for chart; also runs overdue check. Composes StatsCards + RecentBooks + OverdueList + CategoryChart components.

Full loader:
```ts
export function loader() {
  // Run overdue check
  const now = new Date();
  db.update(borrowings).set({ status: 'overdue' })
    .where(and(eq(borrowings.status, 'borrowed'), lt(borrowings.dueDate, now))).run();

  const totalBooks = db.select({ count: count() }).from(books).get()!.count;
  const borrowedCount = db.select({ count: count() }).from(borrowings).where(eq(borrowings.status, 'borrowed')).get()!.count;
  const overdueCount = db.select({ count: count() }).from(borrowings).where(eq(borrowings.status, 'overdue')).get()!.count;
  const categoryCount = db.select({ count: count() }).from(categories).get()!.count;

  const recentBooks = db.select().from(books)
    .leftJoin(categories, eq(books.categoryId, categories.id))
    .orderBy(desc(books.createdAt)).limit(5).all();

  const overdueItems = db.select().from(borrowings)
    .innerJoin(books, eq(borrowings.bookId, books.id))
    .where(eq(borrowings.status, 'overdue')).all();

  const categoryStats = db.select({ name: categories.name, count: count() })
    .from(books)
    .innerJoin(categories, eq(books.categoryId, categories.id))
    .groupBy(categories.name).all();

  return {
    stats: { totalBooks, borrowed: borrowedCount, overdue: overdueCount, categories: categoryCount },
    recentBooks, overdueItems, categoryStats,
  };
}
```

### Phase 4: Build Verification
- [ ] P4-1: Run `bun run check` (TypeScript type check) — fix any type errors
- [ ] P4-2: Run `bun run build` (production build) — fix any build errors
- [ ] P4-3: Run `bun run test:run` — ensure all tests pass
- [ ] P4-4: Manual smoke test checklist: login → dashboard loads → create category → create book with tags → view book detail → edit book → create borrowing → return book → verify dashboard stats → logout

---

## Parallelization Plan

### Batch 1: Foundation (4 parallel coders)

- [ ] **Coder A**: Schema + Validators + DB migration
  - Tasks: P1-1, P1-2, P1-3
  - Files: `app/db/schema.ts`, `app/lib/validators.ts`
  - Commands: `bun run db:generate && bun run db:push`

- [ ] **Coder B**: Session helper + Root update + Routes config + delete old index
  - Tasks: P1-4, P1-5, P1-6, P1-7
  - Files: `app/lib/session.server.ts`, `app/root.tsx`, `app/routes.ts`, `app/routes/_index.tsx` (delete)

- [ ] **Coder C**: Auth pages (login + signup + auth layout)
  - Tasks: P1-8, P1-9, P1-10
  - Files: `app/routes/auth-layout.tsx`, `app/routes/login.tsx`, `app/routes/signup.tsx`

- [ ] **Coder D**: App layout + Sidebar + Dashboard skeleton
  - Tasks: P1-11, P1-12, P1-13
  - Files: `app/components/layout/app-sidebar.tsx`, `app/routes/app-layout.tsx`, `app/routes/dashboard.tsx`

### Batch 2: CRUD Features (4 parallel coders) — after Batch 1

- [ ] **Coder E**: Category CRUD page
  - Tasks: P2-1
  - Files: `app/routes/categories.tsx`

- [ ] **Coder F**: Book form component + Book list page
  - Tasks: P2-2, P2-3
  - Files: `app/components/books/book-form.tsx`, `app/routes/books.tsx`

- [ ] **Coder G**: Book detail + Book edit pages
  - Tasks: P2-5, P2-6
  - Files: `app/routes/book-detail.tsx`, `app/routes/book-edit.tsx`

- [ ] **Coder H**: Add book page (uses book-form from Coder F — acceptable cross-dependency since form component is standalone)
  - Tasks: P2-4
  - Files: `app/routes/books-new.tsx`
  - Note: Imports `BookForm` from `~/components/books/book-form` — must run after Coder F completes book-form.tsx, OR can be batched with Coder F if Coder F creates book-form.tsx first then books.tsx.

**Batch 2 dependency note**: Coder H depends on Coder F's `book-form.tsx`. Option A: run Coder H after Coder F. Option B: run Coder F and Coder H together but instruct Coder H to create a minimal inline form if `book-form.tsx` doesn't exist yet. **Recommended: Option A** — run Coder H in Batch 3 instead.

### Batch 3: Borrowing + Dashboard (5 parallel coders) — after Batch 2

- [ ] **Coder I**: Borrowing list page
  - Tasks: P3-1
  - Files: `app/routes/borrowings.tsx`

- [ ] **Coder J**: New borrowing page + Add book page (moved from Batch 2)
  - Tasks: P2-4, P3-2
  - Files: `app/routes/books-new.tsx`, `app/routes/borrowings-new.tsx`

- [ ] **Coder K**: Dashboard components (stats cards + recent books)
  - Tasks: P3-3, P3-4
  - Files: `app/components/dashboard/stats-cards.tsx`, `app/components/dashboard/recent-books.tsx`

- [ ] **Coder L**: Dashboard components (overdue list + category chart)
  - Tasks: P3-5, P3-6
  - Files: `app/components/dashboard/overdue-list.tsx`, `app/components/dashboard/category-chart.tsx`

- [ ] **Coder M**: Dashboard full implementation (update route)
  - Tasks: P3-7
  - Files: `app/routes/dashboard.tsx` (update)
  - Note: Depends on Coder K + Coder L completing dashboard components. **Run after K and L.**

### Batch 4: Tests + Dashboard Route Update (3 parallel coders) — after Batch 3

- [ ] **Coder N**: Test infrastructure + Validator tests
  - Tasks: T1, T2, T3
  - Files: `tests/setup.ts`, `tests/helpers.ts`, `tests/unit/validators.test.ts`

- [ ] **Coder O**: Schema + CRUD tests
  - Tasks: T4, T5, T6
  - Files: `tests/unit/schema.test.ts`, `tests/unit/categories.test.ts`, `tests/unit/books.test.ts`

- [ ] **Coder P**: Borrowing tests + Dashboard route finalization
  - Tasks: T7, P3-7 (if not done in Batch 3)
  - Files: `tests/unit/borrowings.test.ts`

### Batch 5: Verification (1 coder) — after all previous batches

- [ ] **Coder Q**: Build verification
  - Tasks: P4-1, P4-2, P4-3, P4-4
  - Commands: `bun run check`, `bun run build`, `bun run test:run`
  - Fixes any type/build errors across all files

### Dependencies
1. **Batch 1** must complete before Batch 2 — routes.ts and schema.ts must exist for CRUD pages to compile.
2. **Batch 2** must complete before Batch 3 — book form component and book pages must exist for borrowing pages (which reference book data).
3. **Batch 3 Coder M** depends on Coders K+L — dashboard route imports dashboard components.
4. **Batch 4** can partially overlap with Batch 3 (test infra doesn't depend on UI components).
5. **Batch 5** runs last — must verify the entire application compiles and tests pass.

### Risk Areas
- **Schema self-reference**: The `categories.parentId` self-referencing FK requires `AnySQLiteColumn` import and arrow function syntax. Coder A must use the exact pattern shown in Background & Research.
- **Better Auth session types**: The `Route.LoaderArgs` type from React Router v7 auto-generates from the route module. Coders must use `import type { Route } from './+types/{filename}'` pattern.
- **Tag sync on book edit**: When editing a book, all existing `bookTags` for that book must be deleted first, then re-inserted from the form. This avoids stale tag associations.
- **Overdue check**: Both the dashboard and borrowings page run the overdue status update in their loaders. This is intentional (ensures status is fresh on page load) and idempotent.
- **Shadcn sidebar import paths**: The sidebar component has many sub-exports (SidebarProvider, SidebarContent, SidebarMenu, etc.) — all from `~/components/ui/sidebar`.
- **date-fns import**: Use `import { addDays } from 'date-fns'` (already in dependencies).
- **Drizzle count import**: Use `import { count } from 'drizzle-orm'` for aggregate queries.
- **React Router layout()**: Import `layout` from `@react-router/dev/routes` — this is the function for defining layout routes in programmatic route config.

---

## Done Criteria
- [ ] All auth tables (user, account, session, verification) unchanged from boilerplate
- [ ] Better Auth config (`app/lib/auth.server.ts`) unchanged
- [ ] New tables created: categories, books, tags, book_tags, borrowings (with indexes + relations)
- [ ] Todo table and route removed
- [ ] Login + Signup pages functional using Better Auth email/password
- [ ] App layout with sidebar renders for authenticated users
- [ ] Unauthenticated users redirected to /login
- [ ] Category CRUD: create, rename, delete (with hierarchy)
- [ ] Book CRUD: create with tags, view detail, edit, delete
- [ ] Book list: search by title/author/ISBN, filter by category/tag, paginated
- [ ] Borrowing: create (auto 14-day due date), return, overdue auto-detection
- [ ] Dashboard: stats cards, recent books, overdue list, category chart
- [ ] All UI text in Korean
- [ ] `bun run check` passes (zero type errors)
- [ ] `bun run build` passes (production build succeeds)
- [ ] `bun run test:run` passes (all tests green)
- [ ] No tRPC, no file upload, no 3D preview, no API key auth
