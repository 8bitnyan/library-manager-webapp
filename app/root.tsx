import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from 'react-router';
import type { MiddlewareFunction } from 'react-router';

import { applyOpenCorsToHeaders } from '~/lib/open-cors';
import { Toaster } from '~/components/ui/sonner';

import './styles/globals.css';

const openCorsMiddleware: MiddlewareFunction = async ({ request }, next) => {
  if (request.method === 'OPTIONS') {
    const headers = new Headers();
    applyOpenCorsToHeaders(headers);
    return new Response(null, { status: 204, headers });
  }

  const response = (await next()) as Response;
  const headers = new Headers(response.headers);
  applyOpenCorsToHeaders(headers);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export const middleware = [openCorsMiddleware];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-foreground antialiased">
        {children}
        <Toaster richColors position="top-right" />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">{message}</h1>
        <p className="text-muted-foreground">{details}</p>
        {stack && (
          <pre className="mt-4 w-full overflow-x-auto rounded-md bg-muted p-4 text-left text-sm">
            <code>{stack}</code>
          </pre>
        )}
      </div>
    </main>
  );
}
