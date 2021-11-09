Moralis.Cloud.job("fetchCurrentPowerOutputs", (request) => {
  // params: passed in the job call
  // headers: from the request that triggered the job
  // log: the Moralis Server logger passed in the request
  // message: a function to update the status message of the job object
  const { params, headers, log, message } = request;
  message("Updating current power outputs");
  return fetchAndCachePowerOutputs(request);
});

const fetchAndCachePowerOutputs = async () => {
    const siteQuery = new Moralis.Query("Site");
    const sites = await siteQuery.find();

    const overviewPromises = sites &&
    sites.map((site) => {
        return Moralis.Cloud.httpRequest({
            url: `https://monitoringapi.solaredge.com/site/${site.attributes.siteId}/overview?api_key=${site.attributes.apiKey}`,
          }).then(function (httpResponse) {
            return httpResponse.text;
          });
    })

    const overviews = await Promise.all(overviewPromises);

    overviews.map((overview, index) => {
        const currentPower = JSON.parse(overview).overview.currentPower.power;

        sites[index].set("currentPower", currentPower);
    })

    const siteUpdatePromises = sites &&
    sites.map((site) => {
        return site.save()
    })

    const saveResults = await Promise.all(siteUpdatePromises);

    return saveResults;
};
