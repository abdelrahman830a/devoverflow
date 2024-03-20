"use server";

import { JobType } from "./shared.types";

interface Params {
  searchQuery?: string;
  page?: number;
  pageSize?: number;
  filter?: string;
}

export async function getJobs(params: Params) {
  const { searchQuery, page = 1, pageSize = 10, filter } = params;
  let url = "";

  // Switch statement to map filter options to their corresponding values
  let employmentType = "";
  switch (filter) {
    case "fulFULLTIME":
      employmentType = "FULLTIME";
      break;
    case "PARTTIME":
      employmentType = "PARTTIME";
      break;
    case "INTERN":
      employmentType = "INTERN";
      break;
    case "CONTRACTOR":
      employmentType = "CONTRACTOR";
      break;
    default:
      // Default to no filter if filter doesn't match any option
      employmentType = "";
  }

  url = `https://jsearch.p.rapidapi.com/search?query=${searchQuery}&page=${page}&limit=${pageSize}&remote_jobs_only=false&employment_types=${employmentType}`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "c93a420a4fmsh7f0fb32bce290d7p11ab73jsn3c7cb316863f",
      "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    },
  };
  try {
    const response = await fetch(url, options);
    const responseData = await response.json();

    if (!Array.isArray(responseData.data)) {
      throw new Error("Invalid data format returned from the API");
    }

    const jobs: JobType[] = responseData.data.map((job: any) => ({
      employerName: job.employer_name,
      employerLogo: job.employer_logo,
      employerWebsite: job.employer_website,
      jobPublisher: job.job_publisher,
      jobType: job.job_employment_type,
      jobTitle: job.job_title,
      jobApplyLink: job.job_apply_link,
      jobDescription: job.job_description,
      jobCountry: job.job_country,
      jobDate: job.job_posted_at_datetime_utc,
      jobLocation: job.job_is_remote,
      jobSalary: job.job_max_salary,
    }));

    const isNext = jobs.length === pageSize; // Check if there are more jobs available beyond the current page

    return { jobs, isNext };
  } catch (error) {
    console.error(error);
  }
}
