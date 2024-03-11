import Question from "@/components/forms/Question";
import { getQuestionById } from "@/lib/actions/question.action";
import { getUserById } from "@/lib/actions/user.action";
import { ParamsProps } from "@/types";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

const page = async ({ params }: ParamsProps) => {
  const { userId } = auth();

  if (!userId) redirect("/sign-in");

  const mongoUser = await getUserById({ userId });

  const question = await getQuestionById({ questionId: params.id });

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">Editing a question</h1>

      <div className="mt-9">
        <Question
          type="edit"
          questionDetails={JSON.stringify(question)}
          mongoUserId={mongoUser._id}
        />
      </div>
    </div>
  );
};

export default page;
