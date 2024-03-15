import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const Loading = () => {
  return (
    <section>
      <div className="mb-12 flex justify-between gap-4">
        <Skeleton className="size-40 rounded-full" />
        <div className="flex-col space-y-4">
          <Skeleton className="h-14 w-28" />
          <Skeleton className="h-14 w-28" />
          <Skeleton className="h-14 w-28" />
        </div>
        <div className="flex-col space-y-4">
          <Skeleton className="h-14 w-28" />
          <Skeleton className="h-14 w-28" />
          <Skeleton className="h-14 w-28" />
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
          <Skeleton
            key={item}
            className="h-60 w-full rounded-2xl sm:w-[260px]"
          />
        ))}
      </div>
    </section>
  );
};

export default Loading;
