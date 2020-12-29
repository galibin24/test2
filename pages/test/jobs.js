import { useState } from "react";
// import page specific styles
import styles from "../../styles/jobsPage.module.css";

export default function JobsPage({ jobs }) {
  /* 
    Here we define the filters applied to the list of jobs.(line 13)
    Each filter have a state and handler which defines if filter passes or not.
    This design allows us to add extra fiters to our list with no difficulty and 
    makes the code easily extensible, as code grows the filter handlers can be 
    seperated in diffrent file.
  */
  const [filters, setFilters] = useState({
    sevenDayPostings: {
      state: false,
      handler: (job) => sevenDayPostingsFilter(job),
    },
    companyName: {
      state: false,
      value: "None",
      handler: (job, companyName) => companyNameFilter(job, companyName),
    },
  });
  const companyNames = jobs.slice(0, 10).map((job) => job.companyName);

  // filter for posting dates
  const sevenDayPostingsFilter = (job) => {
    // parse the posted date string
    const postedDate = parseInt(job["postedDate"].match(/\d/g).join(""));
    // compare the posted date
    if (postedDate <= 7) {
      return true;
    }
    return false;
  };

  // filter for companyName
  const companyNameFilter = (job, companyName) => {
    if (job.companyName === companyName) return true;
    return false;
  };

  // Function handling filtering of the jobs list
  const jobsFilter = (job) => {
    // get a list of active filters
    const activeFilters = Object.keys(filters).filter(
      (key) => filters[key].state
    );

    // array of filtering results(if filter passes then true added, else false)
    const filterResults = [];

    for (let filter of activeFilters) {
      // call the filter handling function and push result to filterResults
      const activeFilter = filters[filter];

      // filter the result
      const filterResult = activeFilter.handler(job);

      if (filter == "companyName") {
        filterResult = activeFilter.handler(job, activeFilter.value);
      }
      // push the result to results array
      filterResults.push(filterResult);
    }

    // if all active filters pass return true
    if (filterResults.every((filter) => filter === true)) return true;
    else return false;
  };

  // Handle the change of seven day filter
  const onSevenDayFilterChange = () => {
    setFilters({
      ...filters,
      sevenDayPostings: {
        ...filters.sevenDayPostings,
        // sets the state to oposite of it was before
        state: !filters.sevenDayPostings.state,
      },
    });
  };
  // Handle the change of Company Name filter
  const onCompanyFilterChange = (e) => {
    let filterValue = e.target.value;
    let filterState = true;

    // If None is chosen the filter resets to default
    if (e.target.value == "None") {
      filterValue = "";
      filterState = false;
    }

    const companyFilter = {
      ...filters.companyName,
      state: filterState,
      value: filterValue,
    };

    setFilters({
      ...filters,
      companyName: companyFilter,
    });
  };

  return (
    <div className="container">
      <div className={`row justify-content-center ${styles.filtersContainer}`}>
        <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 btn-prim">
          <div className="form-group">
            <label>Select Company Name</label>
            {/* Select the company out of all companies available */}
            <select
              className="form-control"
              onChange={(e) => onCompanyFilterChange(e)}
            >
              <option value="None">None</option>
              {companyNames.map((name) => {
                return <option key={name}>{name}</option>;
              })}
            </select>
          </div>
        </div>
        <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 btn-prim">
          {/* Button to show only past 7 days */}
          <button
            type="button"
            className={`btn btn-primary ${styles.sevenDaysFilterButton}`}
            onClick={() => onSevenDayFilterChange()}
          >
            Show Jobs in last 7 days
          </button>
        </div>
      </div>

      <div className="row justify-content-center">
        {jobs
          // Choose first 10 jobs
          .slice(0, 10)
          // Filter the jobs
          .filter((job) => {
            // Check if there any active filters
            const anyFiltersActive = Object.values(filters).some(
              (filter) => filter.state
            );
            // If no filter active return all jobs
            if (!anyFiltersActive) return true;
            // Else return the result of filtering
            return jobsFilter(job);
          })
          // Map the filtered jobs to component
          .map((job) => {
            return (
              <div
                key={job.companyName}
                className="col-xl-3 col-lg-4 col-md-6 col-sm-12"
              >
                <div className={styles.jobContainer}>
                  <div className={styles.jobContainerTop}>
                    <div className={styles.jobCompanyName}>
                      {job.companyName}
                    </div>
                    <div className={styles.jobTitle}>{job.jobTitle}</div>
                  </div>

                  <div className={styles.jobDescription}>{job.shortDesc}</div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// server rendering of the jobs request
export async function getServerSideProps() {
  // Fetch jobs data from API
  const res = await fetch(`https://www.zippia.com/api/jobs/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      companySkills: true,
      dismissedListingHashes: [],
      fetchJobDesc: true,
      jobTitle: "Business Analyst",
      locations: [],
      numJobs: 20,
      previousListingHashes: [],
    }),
  });
  // Convert response to json
  const data = await res.json();

  // Pass data to the page via props
  return { props: { jobs: data.jobs } };
}
