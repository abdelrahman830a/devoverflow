"use client";
import { SearchParamsProps } from "@/types";
import { getJobs } from "@/lib/actions/jobs.action";
import LocalSearchbar from "@/components/shared/search/LocalSearchbar";
import Filter from "@/components/shared/Filter";
import { JobsPageFilters } from "@/constants/filters";
import JobFilters from "@/components/shared/JobFilters";
import NoResult from "@/components/shared/NoResult";
import { JobType } from "@/lib/actions/shared.types";
import Image from "next/image";
import Link from "next/link";
import { getTimeStamp } from "@/lib/utils";
import Pagination from "@/components/shared/Pagination";
import { useEffect, useState } from "react";

const Page = ({ searchParams }: SearchParamsProps) => {
  const [jobs, setJobs] = useState([]);
  const [isNext, setIsNext] = useState(false);
  useEffect(() => {
    const fetchJobs = async () => {
      const { jobs, isNext }: any = await getJobs({
        searchQuery: searchParams?.q ? searchParams?.q : "software engineer",
        page: searchParams?.page ? +searchParams?.page : 1,
        filter: searchParams?.filter ? searchParams?.filter : "",
      });
      setJobs(jobs);
      setIsNext(isNext);
    };
    fetchJobs();
  }, [searchParams]);

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Jobs</h1>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchbar
          route="/collection"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for jobs"
          otherClasses="flex-1"
        />
        <Filter
          filters={JobsPageFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </div>
      <JobFilters />

      {jobs.length > 0 ? (
        jobs.map((job: JobType) => (
          <>
            <div className="mt-10" key={job?.jobTitle}>
              <div className="mt-10 flex w-full flex-col gap-6">
                <div className="card-wrapper rounded-[10px] px-11 py-9">
                  <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
                    <Image
                      src={
                        job?.employerLogo
                          ? job?.employerLogo
                          : "/assets/icons/computer.svg"
                      }
                      alt="company logo"
                      width={90}
                      height={90}
                      className="object-contain dark:bg-dark-300"
                    />
                    <div className="flex justify-start gap-5">
                      <div className="flex flex-col">
                        <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-2">
                          {job?.jobTitle}
                        </h3>
                        <Link
                          href={job?.employerWebsite || "/"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2">
                          <h4 className="paragraph-medium text-dark400_light700">
                            {job?.employerName}
                          </h4>
                        </Link>
                        <p className="body-regular mt-0.5 capitalize text-light-500">
                          posted {getTimeStamp(new Date(job?.jobDate))}
                        </p>
                        <p className="body-regular text-dark200_light900 mt-3.5 line-clamp-3">
                          {job?.jobDescription.slice(0, 2000)}
                        </p>
                        <div className="flex items-center gap-3 py-1.5 max-sm:flex-wrap max-sm:justify-start">
                          <p className="small-medium text-light-500">
                            {job?.jobType}
                          </p>
                          <p className="small-medium text-light-500">
                            {job?.jobLocation === false ? "Remote" : "Onsite"}
                          </p>
                          <p className="small-medium text-light-500">
                            {job?.jobSalary
                              ? `Salary: $${job?.jobSalary}`
                              : "Salary: Not Specified"}
                          </p>
                        </div>
                        <div className="flex-between mt-6 w-full flex-wrap gap-3">
                          <Link
                            href={job?.jobApplyLink || "/"}
                            className="flex items-center gap-2"
                            target="_blank"
                            rel="noopener noreferrer">
                            <p className="body-semibold primary-text-gradient">
                              View job
                            </p>
                            <Image
                              alt="arrow up right"
                              width={20}
                              height={20}
                              src="/assets/icons/arrow-up-right.svg"
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ))
      ) : (
        <NoResult
          title="There are no jobs to show"
          description="I have used all of my free API quota and to renew it I must pay great amount of money. Have a great day"
          link="/jobs"
          linkTitle="Explore Jobs"
        />
      )}
      <div className="mt-2.5">
        <Pagination
          pageNumber={searchParams?.page ? +searchParams?.page : 1}
          isNext={isNext}
        />
      </div>
    </>
  );
};

export default Page;
