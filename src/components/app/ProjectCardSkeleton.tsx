
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProjectCardSkeleton() {
  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="p-0">
        <Skeleton className="aspect-[16/10] w-full" />
      </CardHeader>
      <CardContent className="p-5 flex-grow flex flex-col">
        <Skeleton className="h-5 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6 mb-4" />
        <div className="flex items-center text-xs mt-auto mb-3">
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-28 rounded-full" />
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Skeleton className="h-9 w-full rounded-md" />
      </CardFooter>
    </Card>
  );
}
