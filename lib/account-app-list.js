import nrdbQuery from "./nrdb-query";


/**
 * get the list of apps reporting for this time period and currently selected account.
 */
export default async function accountAppList(_account) {

  /* might want to me more conscience of the timerange here */
  //const __nrql = `SELECT uniques(appName) FROM Transaction SINCE 30 MINUTES AGO LIMIT MAX`;
  const __nrql = `SELECT uniques(appName) FROM Transaction where containerId IS NOT NULL SINCE 30 MINUTES AGO LIMIT MAX`;

  var __results = await nrdbQuery(_account.id, __nrql);
  var __adjusted_results = __results[0]["uniques.appName"].sort();

  /* one thing to consider here is the compute we want to map might not be in the same account they we are root selecting for the
  app list ... so we might want to have an option to look more expansively at all the compute resourcs that match our app context */

  //adding the "All" option to the list of apps for the default view.
  __adjusted_results.unshift("All");
  
  return(__adjusted_results);
} //accountAppList