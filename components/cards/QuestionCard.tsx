import React from "react";
import Link from "next/link";
import RenderTag from "../shared/RenderTag";
import Metric from "../shared/Metric";
import { formatNumber, getTimeStamp } from "@/lib/utils";
import { SignedIn, auth } from "@clerk/nextjs";
import CardsActions from "../shared/CardsActions";

interface QuestionProps {
  _id: string;
  // clerkId?: string | null | undefined;
  title: string;
  tags: {
    _id: string;
    name: string;
  }[];
  author: {
    _id: string;
    clerkId: string;
    name: string;
    picture: string;
  };
  views: number;
  upvotes: string[];
  answers: Array<object>;
  createdAt: Date;
}

const QuestionCard = async ({
  _id,
  // clerkId,
  title,
  tags,
  author,
  views,
  upvotes,
  answers,
  createdAt,
}: QuestionProps) => {
  const { userId: clerkId } = auth();

  return (
    <div className="card-wrapper rounded-[10px] px-11 py-9">
      <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
        <div className="justify-start">
          <span className="subtle-regular text-dark400_light700 line-clamp-1 flex md:hidden">
            {getTimeStamp(createdAt)}
          </span>

          <Link href={`/question/${_id}`}>
            <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1">
              {title}
            </h3>
          </Link>
        </div>
        {/* If signed in add edit delete actions */}
        <SignedIn>
          {clerkId === author.clerkId && (
            <CardsActions
              clerkId={clerkId}
              type="question"
              itemId={JSON.stringify(_id)}
            />
          )}
        </SignedIn>
      </div>

      <div className="mt-3.5 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <RenderTag key={tag._id} _id={tag._id} name={tag.name} />
        ))}
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
        <div className="flex items-center gap-3 max-sm:flex-wrap max-sm:justify-start">
          <Metric
            imgUrl="/assets/icons/like.svg"
            alt="upvotes"
            value={formatNumber(upvotes.length)}
            title="Upvotes"
            textStyles="small-medium text-dark400_light800"
          />
          <Metric
            imgUrl="/assets/icons/message.svg"
            alt="message"
            value={formatNumber(answers.length)}
            title="Answers"
            textStyles="small-medium text-dark400_light800"
          />
          <Metric
            imgUrl="/assets/icons/eye.svg"
            alt="eye"
            value={formatNumber(views)}
            title="Views"
            textStyles="small-medium text-dark400_light800"
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
