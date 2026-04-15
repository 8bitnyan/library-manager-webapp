import { Box, FileType, FolderTree, HardDrive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type Stats = {
  totalModels: number;
  totalSize: number;
  categories: number;
  fileTypes: number;
};

type StatsCardsProps = {
  stats: Stats;
};

function formatStorageSize(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return "0 MB";
}

export function StatsCards({ stats }: StatsCardsProps) {
  const items = [
    {
      label: "총 모델 수",
      value: stats.totalModels.toLocaleString(),
      icon: Box,
    },
    {
      label: "총 저장 용량",
      value: formatStorageSize(stats.totalSize),
      icon: HardDrive,
    },
    {
      label: "카테고리 수",
      value: stats.categories.toLocaleString(),
      icon: FolderTree,
    },
    {
      label: "파일 형식 수",
      value: stats.fileTypes.toLocaleString(),
      icon: FileType,
    },
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}