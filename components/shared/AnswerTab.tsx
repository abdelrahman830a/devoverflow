import { getUserAnswers } from "@/lib/actions/user.action";
import AnswerCard from "../cards/AnswerCard";
import { SearchParamsProps } from "@/types";

interface Props extends SearchParamsProps {
  userId: string;
  clerkId?: string | null;
}

const AnswerTab = async ({ clerkId, userId, searchProps }: Props) => {
  const result = await getUserAnswers({
    userId,
  });
  return (
    <>
      {result.answers.map((item) => (
        <AnswerCard
          key={item._id}
          clerkId={clerkId}
          _id={item._id}
          question={item.question}
          author={item.author}
          upvotes={item.upvotes.length}
          downvotes={item.downvotes.length}
          createdAt={item.createdAt}
        />
      ))}
    </>
  );
};

export default AnswerTab;
