import { useState } from "react";
// import page specific styles
import styles from "../../styles/jobsPage.module.css";
import Select from "react-select";

export default function JobsPage({ jobs }) {
  /* 
    Here we define the filters applied to the list of jobs.(line 13)
    Each filter have a state and handler which defines if filter passes or not.
    This design allows us to add extra fiters to our filters stata with no difficulty and 
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
  const companyNames = jobs.slice(0, 10).map((job) => {
    return {
      label: job.companyName,
      value: job.companyName,
    };
  });

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
      let filterResult = activeFilter.handler(job);

      // if fi
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
  const onCompanyFilterChange = (opt) => {
    let filterValue = opt.value;
    let filterState = true;

    // If None is chosen the filter resets to default
    if (opt.value == "None") {
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
            <Select
              options={[...companyNames, { value: "None", label: "None" }]}
              id="Company Name Select"
              onChange={(opt) => onCompanyFilterChange(opt)}
              defaultValue={{ value: "None", label: "None" }}
            ></Select>
          </div>
        </div>
        <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 btn-prim">
          {/* Button to show only past 7 days */}
          <button
            type="button"
            className={`btn btn-primary ${styles.sevenDaysFilterButton}`}
            onClick={() => onSevenDayFilterChange()}
          >
            {filters.sevenDayPostings.state
              ? "Show all jobs"
              : "Show Jobs in last 7 days"}
          </button>
        </div>
      </div>

      <div className="row justify-content-center">
        {jobs
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
          // Choose first 10 jobs
          .slice(0, 10)
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

// TODO best practices for js 
// TODO design patterns 
// TODO query optimization   
// TODO float in css(clear float)
// TODO MongoDB query 
// TODO debounce and throttle

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
