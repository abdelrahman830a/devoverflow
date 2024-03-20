import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Jobs | DevOverFlow",
  description:
    "Ask questions, get answers, and engage with the DevOverFlow community.",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default Layout;
