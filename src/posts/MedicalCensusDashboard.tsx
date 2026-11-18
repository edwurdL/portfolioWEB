import Figure from './Figure'

const FOLDER = 'medical-census-dashboard'

export default function MedicalCensusDashboard() {
  return (
    <>
      <p>
        I built a Tableau dashboard on more than 400,000 state-wide medical census data points. It makes
        trends easy to see and lets you break them down by demographics and geography.
      </p>

      <h2>The dashboard</h2>
      <p>
        I put the main views of the census on a single screen: unique patients and readmissions, how
        long stays last, monthly hospital stays with the share that were readmissions, how many
        different hospitals members visited, a county map of visits, admissions by level of care, a
        breakdown by primary diagnosis, and the age distribution.
      </p>

      <Figure folder={FOLDER} file="dashboard.webp" caption="The census dashboard" />

      <h2>The data pipeline</h2>
      <p>
        Behind the dashboard I’m building an ETL pipeline that automates ingesting, cleaning, and
        transforming the incoming census data before it reaches Tableau. One job in it fixes up
        admission and discharge dates and adds the fields the dashboard depends on, including a stay ID
        and a flag for readmissions.
      </p>

      <Figure
        folder={FOLDER}
        file="ds.webp"
        caption="The ETL job that prepares the census data, adding stay IDs, corrected dates and readmission flags"
      />
    </>
  )
}
