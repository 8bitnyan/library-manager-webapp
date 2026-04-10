import { useState } from 'react';
import { useFetcher, type MetaFunction } from 'react-router';
import { desc, eq } from 'drizzle-orm';

import { db } from '~/lib/db.server';
import { todos } from '~/db/schema';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import { Input } from '~/components/ui/input';

import type { Route } from './+types/_index';

export const meta: MetaFunction = () => [
  { title: 'Todo List' },
  { name: 'description', content: 'Simple todo list app' },
];

export function loader() {
  const allTodos = db.select().from(todos).orderBy(desc(todos.createdAt)).all();
  return { todos: allTodos };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  switch (intent) {
    case 'create': {
      const text = formData.get('text');
      if (typeof text === 'string' && text.trim().length > 0) {
        db.insert(todos).values({ text: text.trim() }).run();
      }
      break;
    }
    case 'toggle': {
      const id = Number(formData.get('id'));
      const todo = db.select().from(todos).where(eq(todos.id, id)).get();
      if (todo) {
        db.update(todos)
          .set({ completed: todo.completed ? 0 : 1 })
          .where(eq(todos.id, id))
          .run();
      }
      break;
    }
    case 'delete': {
      const id = Number(formData.get('id'));
      db.delete(todos).where(eq(todos.id, id)).run();
      break;
    }
  }

  return { ok: true };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const [text, setText] = useState('');
  const fetcher = useFetcher();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim()) return;
    fetcher.submit(
      { intent: 'create', text: text.trim() },
      { method: 'POST' },
    );
    setText('');
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-center text-3xl font-bold">Todo List</h1>
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a new todo"
                maxLength={256}
              />
              <Button type="submit">Add</Button>
            </form>
            <ul className="space-y-2">
              {loaderData.todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={todo.completed === 1}
                      onCheckedChange={() => {
                        fetcher.submit(
                          { intent: 'toggle', id: String(todo.id) },
                          { method: 'POST' },
                        );
                      }}
                    />
                    <span
                      className={
                        todo.completed === 1
                          ? 'text-muted-foreground line-through'
                          : undefined
                      }
                    >
                      {todo.text}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      fetcher.submit(
                        { intent: 'delete', id: String(todo.id) },
                        { method: 'POST' },
                      );
                    }}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
