import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

type RecentModel = {
  id: string;
  name: string;
  fileType: string;
  fileSize: number;
  createdAt: Date | number | string;
};

type RecentModelsProps = {
  models: RecentModel[];
};

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${bytes} B`;
}

export function RecentModels({ models }: RecentModelsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 등록 모델</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>모델명</TableHead>
              <TableHead>파일 형식</TableHead>
              <TableHead className="text-right">파일 크기</TableHead>
              <TableHead className="text-right">등록일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.slice(0, 5).map((model) => (
              <TableRow key={model.id}>
                <TableCell className="font-medium">{model.name}</TableCell>
                <TableCell>{model.fileType.toUpperCase()}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatFileSize(model.fileSize)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {format(new Date(model.createdAt), "yyyy.MM.dd")}
                </TableCell>
              </TableRow>
            ))}
            {models.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  등록된 모델이 없습니다
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
