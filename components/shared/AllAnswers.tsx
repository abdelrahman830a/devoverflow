import React from "react";
import Filter from "./Filter";
import { AnswerFilters } from "@/constants/filters";
import { getAllAnswers } from "@/lib/actions/answer.action";
import Image from "next/image";
import Link from "next/link";
import { getTimeStamp } from "@/lib/utils";
import ParseHTML from "./ParseHTML";
import Votes from "./Votes";
import Pagination from "./Pagination";

interface Props {
  questionId: string;
  authorId: string;
  totalAnswers: number;
  filter?: string;
  page?: string;
  pageSize?: number;
  searchParams?: any;
}

const AllAnswers = async ({
  questionId,
  authorId,
  totalAnswers,
  filter,
  page,
}: Props) => {
  const result = await getAllAnswers({
    questionId,
    sortBy: filter,
    page: page ? +page : 1,
  });
  return (
    <div className="mt-11">
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">{totalAnswers} Answers</h3>

        <Filter filters={AnswerFilters} />
      </div>

      <div>
        {result?.answers.map((answer) => (
          <article key={answer._id} className="light-border border-b py-10">
            <div className="flex items-center justify-between">
              <div className="mb-8 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
                <Link
                  href={`/profile/${answer.author.clerkId}`}
                  className="flex flex-1 items-start gap-1 sm:items-center">
                  <Image
                    src={answer.author.picture}
                    width={18}
                    height={18}
                    alt="profile picture"
                    className="rounded-full object-cover max-sm:mt-0.5"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <p className="body-semibold text-dark300_light700 ">
                      {answer.author.name}
                    </p>

                    <p className="small-regular text-light400_light500 ml-0.5 mt-0.5 line-clamp-1">
                      answered {getTimeStamp(answer.createdAt)}
                    </p>
                  </div>
                </Link>
                <div className="flex justify-end">
                  <Votes
                    type="Answer"
                    itemId={answer._id}
                    userId={authorId}
                    upvotes={answer.upvotes.length}
                    hasupVoted={answer.upvotes.includes(authorId)}
                    downvotes={answer.downvotes.length}
                    hasdownVoted={answer.downvotes.includes(authorId)}
                  />
                </div>
              </div>
            </div>
            <ParseHTML data={answer.content} />
          </article>
        ))}
      </div>
      <div className="mt-10">
        <Pagination pageNumber={page ? +page : 1} isNext={result?.isNext} />
      </div>
    </div>
  );
};

export default AllAnswers;
