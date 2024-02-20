import Image from "next/image";
import Link from "next/link";
import React from "react";
import RenderTag from "../RenderTag";

const popularTags = [
  {
    _id: "1",
    name: "React",
    totalQuestions: 25,
  },
  {
    _id: "2",
    name: "JavaScript",
    totalQuestions: 60,
  },
  {
    _id: "3",
    name: "TypeScript",
    totalQuestions: 34,
  },
  {
    _id: "4",
    name: "Python",
    totalQuestions: 22,
  },
  {
    _id: "5",
    name: "MongoDB",
    totalQuestions: 19,
  },
  {
    _id: "6",
    name: "Sql",
    totalQuestions: 15,
  },
  {
    _id: "7",
    name: "Node.js",
    totalQuestions: 10,
  },
];

const RightSidebar = () => {
  const hotQuestions = [
    {
      _id: "1",
      title: "How to use React Query with Next.js",
    },
    {
      _id: "2",
      title: "How to create a custom hook in React?",
    },
    {
      _id: "3",
      title: "why is my react component not rendering?",
    },
    {
      _id: "4",
      title: "what is the best way to learn React?",
    },
    {
      _id: "5",
      title: "When to use useReducer in React?",
    },
  ];
  return (
    <section className="background-light900_dark200 light-border custom-scrollbar sticky right-0 top-0 flex h-screen w-[350px] flex-col overflow-y-auto border-l p-6 pt-36 shadow-light-300 dark:shadow-none max-xl:hidden">
      <div className="flex flex-col gap-6">
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>
        <div className="mt-7 flex w-full flex-col gap-[30px]">
          {hotQuestions.map((question) => (
            <Link
              key={question._id}
              href={`/questions/${question._id}`}
              className="flex cursor-pointer items-center justify-between gap-7">
              <p className="body-medium text-dark500_light700">
                {question.title}
              </p>
              <Image
                src="/assets/icons/chevron-right.svg"
                alt="chevron-right"
                width={20}
                height={20}
                className="invert-colors"
              />
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <div className="mt-7 flex flex-col gap-4">
          {popularTags.map((tag) => (
            <RenderTag
              key={tag._id}
              _id={tag._id}
              name={tag.name}
              totalQuestions={tag.totalQuestions}
              showCount
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;
