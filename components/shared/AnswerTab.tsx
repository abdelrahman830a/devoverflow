import { getUserAnswers } from "@/lib/actions/user.action";
import AnswerCard from "../cards/AnswerCard";
import { SearchParamsProps } from "@/types";
import Pagination from "./Pagination";

interface Props extends SearchParamsProps {
  userId: string;
  clerkId?: string | null | undefined;
  searchParams: any;
}

const AnswerTab = async ({ clerkId, userId, searchParams }: Props) => {
  const result = await getUserAnswers({
    userId,
    page: searchParams?.page ? searchParams.page : 1,
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
      <div className="mt-10">
        <Pagination
          pageNumber={searchParams?.page ? +searchParams.page : 1}
          isNext={result?.isNext}
        />
      </div>
    </>
  );
};

export default AnswerTab;
