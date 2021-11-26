// This cloud job is not used anymore and can be removed

Moralis.Cloud.job("fetchSiteOverviews", (request) => {
  // params: passed in the job call
  // headers: from the request that triggered the job
  // log: the Moralis Server logger passed in the request
  // message: a function to update the status message of the job object
  const { params, headers, log, message } = request;
  message("Updating current power outputs");
  return fetchAndCacheSiteOverviews(request);
});

const appendDelayToPromise = (promise, delayInMs) =>
  promise.then(
    (value) =>
      new Promise((resolve) => setTimeout(() => resolve(value), delayInMs))
  );

const fetchAndCacheSiteOverviews = async () => {
  const siteQuery = new Moralis.Query("Site");
  const sites = await siteQuery.find();

  const overviewPromises =
    sites &&
    sites.map((site) => {
      return Moralis.Cloud.httpRequest({
        url: `https://monitoringapi.solaredge.com/site/${site.attributes.siteId}/overview?api_key=${site.attributes.apiKey}`,
      }).then(function (httpResponse) {
        return httpResponse.text;
      });
    });

  const DELAY_PER_REQUEST = 1000;

  const requestsWithDelay = overviewPromises.map((overviewPromise, index) =>
    appendDelayToPromise(overviewPromise, index * DELAY_PER_REQUEST)
  );
  
  const overviews = await Promise.all(requestsWithDelay);

  overviews.map((overview, index) => {
    const overviewData = JSON.parse(overview)?.overview;
    const currentPower = overviewData?.currentPower?.power;
    const lastDayEnergy = overviewData?.lastDayData?.energy;
    const lastMonthEnergy = overviewData?.lastMonthData?.energy;
    const lastYearEnergy = overviewData?.lastYearData?.energy;
    const lifeTimeEnergy = overviewData?.lifeTimeData?.energy;

    currentPower !== undefined && sites[index].set("currentPower", currentPower);
    lastDayEnergy !== undefined && sites[index].set("lastDayEnergy", lastDayEnergy);
    lastMonthEnergy !== undefined && sites[index].set("lastMonthEnergy", lastMonthEnergy);
    lastYearEnergy !== undefined && sites[index].set("lastYearEnergy", lastYearEnergy);
    lifeTimeEnergy !== undefined && sites[index].set("lifeTimeEnergy", lifeTimeEnergy);
  });

  const siteUpdatePromises =
    sites &&
    sites.map((site) => {
      return site.save();
    });

  const saveResults = await Promise.all(siteUpdatePromises);

  return saveResults;
};
