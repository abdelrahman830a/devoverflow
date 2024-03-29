"use client";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { deleteQuestion } from "@/lib/actions/question.action";
import { deleteAnswer } from "@/lib/actions/answer.action";
import { toast } from "../ui/use-toast";

interface Props {
  type?: string;
  itemId: string;
  authorId?: string;
  questionId?: string;
}

const CardsActions = ({ type, itemId, authorId, questionId }: Props) => {
  const pathName = usePathname();
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/question/edit/${JSON.parse(itemId)}`);
  };

  const handleDelete = async () => {
    if (type === "question") {
      // delete Question
      await deleteQuestion({
        questionId: JSON.parse(itemId),
        path: pathName,
        authorId,
      });
      router.push("/");
      toast({
        title: "success",
        description: "Question deleted successfully",
      });
    } else {
      // delete Answer
      await deleteAnswer({
        answerId: JSON?.parse(itemId) ? JSON.parse(itemId) : itemId,
        path: pathName,
        authorId,
      });
      router.push(`/question/${JSON.parse(questionId || "")}`);
      toast({
        title: "success",
        description: "Answer deleted successfully",
      });
    }
  };

  return (
    <div className="flex items-center justify-end gap-3 max-sm:w-full">
      {type === "question" && (
        <Image
          src="/assets/icons/edit.svg"
          alt="trash"
          width={14}
          height={14}
          className="cursor-pointer object-cover"
          onClick={handleEdit}
        />
      )}
      <Image
        src="/assets/icons/trash.svg"
        alt="trash"
        width={14}
        height={14}
        className="cursor-pointer object-cover"
        onClick={handleDelete}
      />
    </div>
  );
};

export default CardsActions;
