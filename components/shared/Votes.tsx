"use client";

import { donwVoteAnswer, upvoteAnswer } from "@/lib/actions/answer.action";
import { viewQuestion } from "@/lib/actions/interaction.action";
import {
  donwVoteQuestion,
  upvoteQuestion,
} from "@/lib/actions/question.action";
import { toggleSaveQuestion } from "@/lib/actions/user.action";
import { formatNumber } from "@/lib/utils";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "../ui/use-toast";

interface Props {
  type: string;
  itemId: string;
  userId: string;
  upvotes: number;
  hasupVoted: boolean;
  downvotes: number;
  hasdownVoted: boolean;
  hasSaved?: boolean;
}

const Votes = ({
  type,
  itemId,
  userId,
  upvotes,
  hasupVoted,
  downvotes,
  hasdownVoted,
  hasSaved,
}: Props) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleVote = async (action: string) => {
    // eslint-disable-next-line no-useless-return
    if (!userId)
      return toast({
        title: "Please log in",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });

    if (action === "upvote") {
      if (type === "Question") {
        await upvoteQuestion({
          questionId: itemId,
          userId,
          hasupVoted,
          hasdownVoted,
          path: pathname,
        });
      } else if (type === "Answer") {
        await upvoteAnswer({
          answerId: itemId,
          userId,
          hasupVoted,
          hasdownVoted,
          path: pathname,
        });
      }
      return toast({
        variant: !hasupVoted ? "default" : "destructive",
        title: `Upvote ${!hasupVoted ? "Successful" : "Removed"}`,
      });
    }

    if (action === "downvote") {
      if (type === "Question") {
        await donwVoteQuestion({
          questionId: itemId,
          userId,
          hasupVoted,
          hasdownVoted,
          path: pathname,
        });
      } else if (type === "Answer") {
        await donwVoteAnswer({
          answerId: itemId,
          userId,
          hasupVoted,
          hasdownVoted,
          path: pathname,
        });
      }
      return toast({
        title: `Downvote ${!hasdownVoted ? "Successful" : "Removed"}`,
        variant: !hasdownVoted ? "default" : "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!userId)
      return toast({
        title: "Please log in",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });

    await toggleSaveQuestion({
      questionId: itemId,
      userId,
      path: pathname,
    });
    return toast({
      title: `Question ${
        !hasSaved ? "Saved to" : "Removed from"
      } your collection`,
      variant: !hasSaved ? "default" : "destructive",
    });
  };

  useEffect(() => {
    viewQuestion({
      questionId: itemId,
      userId: userId || undefined,
    });
  }, [itemId, userId, pathname, router]);

  return (
    <div className="flex gap-5">
      <div className="flex-center gap-2.5">
        <div className="flex-center gap-1.5">
          <Image
            src={
              hasupVoted
                ? "/assets/icons/upvoted.svg"
                : "/assets/icons/upvote.svg"
            }
            alt="upvote icon"
            width={18}
            height={18}
            className="cursor-pointer"
            onClick={() => handleVote("upvote")}
          />
          <div className="flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1">
            <p className="subtle-medium text-dark400_light900">
              {formatNumber(upvotes)}
            </p>
          </div>
        </div>
        <div className="flex-center gap-1.5">
          <Image
            src={
              hasdownVoted
                ? "/assets/icons/downvoted.svg"
                : "/assets/icons/downvote.svg"
            }
            alt="downvote icon"
            width={18}
            height={18}
            className="cursor-pointer"
            onClick={() => handleVote("downvote")}
          />
          <div className="flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1">
            <p className="subtle-medium text-dark400_light900">
              {formatNumber(downvotes)}
            </p>
          </div>
        </div>
      </div>
      {type === "Question" && (
        <Image
          src={
            hasSaved
              ? "/assets/icons/star-filled.svg"
              : "/assets/icons/star-red.svg"
          }
          alt="star icon"
          width={18}
          height={18}
          className="cursor-pointer"
          onClick={handleSave}
        />
      )}
    </div>
  );
};

export default Votes;
