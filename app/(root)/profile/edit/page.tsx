import Profile from "@/components/forms/Profile";
import { getUserById } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Edit Profile | DevOverFlow",
  description:
    "Ask questions, get answers, and engage with the DevOverFlow community.",
};

const page = async () => {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const mongoUser = await getUserById({ userId });
  if (!mongoUser) redirect("/");

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">Edit Profile</h1>

      <div className="mt-9">
        <Profile clerkId={userId} user={JSON.stringify(mongoUser)} />
      </div>
    </div>
  );
};

export default page;
