"use client";

import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

const Jobs = ({ searchParams }: any) => {
  const router = useRouter();
  const pathname = usePathname();
  const query = searchParams.q;
  const filter = searchParams.filter;

  useEffect(() => {
    if (!query) {
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "q",
        value: query,
      });
      router.push(newUrl);
    } else {
      if (pathname === "/jobs" && !query) {
        const newUrl = removeKeysFromQuery({
          params: searchParams.toString(),
          keys: ["q"],
        });
        router.push(newUrl);
      }
    }
  }, [router, query, filter, searchParams, pathname]);

  return <div>{/* Your component code here */}</div>;
};

export default Jobs;
