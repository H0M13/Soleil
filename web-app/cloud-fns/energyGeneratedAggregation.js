Moralis.Cloud.job("energyGeneratedAggregation", (request) => {
  // params: passed in the job call
  // headers: from the request that triggered the job
  // log: the Moralis Server logger passed in the request
  // message: a function to update the status message of the job object
  const { params, headers, log, message } = request;
  message("Aggregating all time stats");
  return fetchAndCacheAggregatedEnergyStats(request);
});

const fetchAndCacheAggregatedEnergyStats = async () => {
  const energydataStreamId =
    "kjzl6cwe1jw147safajau7c6b2m0n52el7fynws4mm7o1z0dg35dzvbheibqv7s";
  const response = await Moralis.Cloud.httpRequest({
    url: `https://ceramic-clay.3boxlabs.com/api/v0/streams/${energydataStreamId}`,
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  }).then(function (httpResponse) {
    return httpResponse.data;
  });

  const allTimeEnergyGenerated = response.state.next.content.sites.reduce(
    (runningTotal, site) => {
      return (
        runningTotal +
        site.data.reduce((innerRunningTotal, datum) => {
          return innerRunningTotal + datum.energyProduced;
        }, 0)
      );
    },
    0
  );

  const date = new Date().toISOString().split('T')[0];

  const todayEnergyGenerated = response.state.next.content.sites.reduce(
    (runningTotal, site) => {
      return (
        runningTotal +
        site.data.reduce((innerRunningTotal, datum) => {
          if (datum.date.startsWith(date)) {
            return innerRunningTotal + datum.energyProduced;
          } else {
            return innerRunningTotal;
          }
        }, 0)
      );
    },
    0
  );

  const AggregateSnapshot = Moralis.Object.extend("AggregateSnapshot");
  const aggregateSnapshot = new AggregateSnapshot();

  aggregateSnapshot.set("allTimeEnergyGenerated", allTimeEnergyGenerated);
  aggregateSnapshot.set("todayEnergyGenerated", todayEnergyGenerated);

  const saveResult = await aggregateSnapshot.save(null, { useMasterKey: true });
  return saveResult;
};
