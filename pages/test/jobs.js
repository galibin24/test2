// import page specific styles
import { useState } from "react";
import styles from "../../styles/jobsPage.module.css";

export default function jobsPage({ jobs }) {
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
      value: "",
      handler: (job, filterState) => companyNameFilter(job, filterState),
    },
  });

  const sevenDayPostingsFilter = (job) => {
    if (parseInt(job["postedDate"].charAt(0)) <= 7) {
      return true;
    } else return false;
  };

  const companyNameFilter = (job, filterState) => {
    if (job.companyName == filterState.value) return true;
    else return false;
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
      filterResults.push(filters[filter].handler(job, filters[filter]));
    }

    // if all active filters pass return true
    if (filterResults.every((filter) => filter === true)) return true;
    else return false;
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-3 btn-prim">
          <div class="form-group">
            <label for="exampleFormControlSelect1">Select Company Name</label>
            <select
              class="form-control"
              id="exampleFormControlSelect1"
              onChange={(e) => {
                console.log(e.target.value);
                // if none chosen as a value the filter goes to default
                if (e.target.value == "None") {
                  setFilters({
                    ...filters,
                    companyName: {
                      ...filters.companyName,
                      state: false,
                      value: "",
                    },
                  });
                } else {
                  setFilters({
                    ...filters,
                    companyName: {
                      ...filters.companyName,
                      state: true,
                      value: e.target.value,
                    },
                  });
                }
              }}
            >
              <option>None</option>
              {jobs.slice(0, 10).map((job) => {
                return <option>{job.companyName}</option>;
              })}
            </select>
          </div>
        </div>
        <div className="col-lg-3 btn-prim">
          <button
            type="button"
            class="btn btn-primary"
            onClick={() =>
              setFilters({
                ...filters,
                sevenDayPostings: {
                  ...filters.sevenDayPostings,
                  state: !filters.sevenDayPostings.state,
                },
              })
            }
          >
            Show Jobs in last 7 days
          </button>
        </div>
      </div>

      <div className="row justify-content-center">
        {/* check if any filters apply*/}
        {Object.values(filters).some((filter) => filter.state)
          ? // if filters apply then filter the jobs list before displaying
            jobs
              .slice(0, 10)
              .filter((job) => jobsFilter(job))
              .map((job) => {
                return (
                  <div className="col-lg-3">
                    <h5>{job.jobTitle}</h5>
                    <p>{job.companyName}</p>
                    <p>{job.shortDesc}</p>
                  </div>
                );
              })
          : // if no filter apply, display all jobs
            jobs
              .map((job) => {
                return (
                  <div className="col-lg-3">
                    <h5>{job.jobTitle}</h5>
                    <p>{job.companyName}</p>
                    <p>{job.shortDesc}</p>
                  </div>
                );
              })
              .slice(0, 10)}
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
