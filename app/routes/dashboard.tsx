import { count, desc, eq, sum } from 'drizzle-orm';
import { CategoryChart } from '~/components/dashboard/category-chart';
import { RecentModels } from '~/components/dashboard/recent-models';
import { StatsCards } from '~/components/dashboard/stats-cards';
import { categories, models } from '~/db/schema';
import { db } from '~/lib/db.server';
import type { Route } from './+types/dashboard';

export const meta = () => [{ title: '대시보드 - 3D 모델 저장소' }];

export async function loader() {
  const totalModels = (await db.select({ count: count() }).from(models))[0]?.count ?? 0;
  const totalSize = Number((await db.select({ totalSize: sum(models.fileSize) }).from(models))[0]?.totalSize ?? 0);
  const categoriesCount = (await db.select({ count: count() }).from(categories))[0]?.count ?? 0;
  const fileTypesCount = (await db.select({ fileType: models.fileType }).from(models).groupBy(models.fileType)).length;

  const recentModels = (await db
    .select()
    .from(models)
    .leftJoin(categories, eq(models.categoryId, categories.id))
    .orderBy(desc(models.createdAt))
    .limit(5))
    .map((row: { model: typeof models.$inferSelect }) => ({
      id: row.model.id,
      name: row.model.name,
      fileType: row.model.fileType,
      fileSize: row.model.fileSize,
      createdAt: row.model.createdAt,
    }));

  const categoryStats = await db
    .select({ name: categories.name, count: count() })
    .from(models)
    .innerJoin(categories, eq(models.categoryId, categories.id))
    .groupBy(categories.name);

  return {
    stats: {
      totalModels,
      totalSize,
      categories: categoriesCount,
      fileTypes: fileTypesCount,
    },
    recentModels,
    categoryStats,
  };
}

export default function DashboardPage({ loaderData }: Route.ComponentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">대시보드</h1>
      </div>

      <StatsCards stats={loaderData.stats} />

      <div className="grid gap-6 xl:grid-cols-2">
        <RecentModels models={loaderData.recentModels} />
        <CategoryChart data={loaderData.categoryStats} />
      </div>
    </div>
  );
}