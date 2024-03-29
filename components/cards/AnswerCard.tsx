import { formatNumber, getTimeStamp } from "@/lib/utils";
import Link from "next/link";
import Metric from "../shared/Metric";
import CardsActions from "../shared/CardsActions";
import { SignedIn } from "@clerk/nextjs";

interface Props {
  clerkId?: string | null | undefined;
  _id: string;
  question: {
    _id: string;
    title: string;
  };
  author: {
    _id: string;
    clerkId: string | null | undefined;
    name: string;
    picture: string;
  };
  upvotes: number;
  downvotes: number;
  createdAt: Date;
}

const AnswerCard = ({
  clerkId,
  _id,
  question,
  author,
  upvotes,
  downvotes,
  createdAt,
}: Props) => {
  return (
    <Link
      href={`/question/${question._id}/#${_id}`}
      className="card-wrapper rounded-[10px] px-11 py-9">
      <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
        <div>
          <span className="subtle-regular text-dark400_light700 ms:hidden line-clamp-1 flex">
            {getTimeStamp(createdAt)}
          </span>
          <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1">
            {question.title}
          </h3>
        </div>

        <SignedIn>
          <CardsActions itemId={JSON.stringify(_id)} />
        </SignedIn>
      </div>

      <div className="flex-between mt-6 w-full flex-wrap gap-3">
        <Metric
          imgUrl={author?.picture}
          alt="user"
          value={author.name}
          title={` - asked ${getTimeStamp(createdAt)}`}
          href={`/profile/${author._id}`}
          isAuthor
          textStyles="body-medium text-dark400_light700"
        />
        <Metric
          imgUrl="/assets/icons/like.svg"
          alt="upvotes"
          value={formatNumber(upvotes)}
          title="Upvotes"
          textStyles="small-medium text-dark400_light800"
        />
      </div>
    </Link>
  );
};

export default AnswerCard;
