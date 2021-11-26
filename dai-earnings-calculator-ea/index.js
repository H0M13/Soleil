const { Requester } = require("@chainlink/external-adapter");
const fs = require("fs");
const { CeramicClient } = require("@ceramicnetwork/http-client");
const KeyDidResolver = require("key-did-resolver");
const { DID } = require("dids");
const { Ed25519Provider } = require("key-did-provider-ed25519");
const { fromString } = require("uint8arrays/from-string");
const startOfDay = require("date-fns/startOfDay");
const formatISO = require("date-fns/formatISO");
const {
  parseISO,
  differenceInDays,
  addDays,
  getUnixTime,
} = require("date-fns");
const CumulativePaymentTree = require("./cumulative-payment-tree.js");
const poolManagerContract = require("./poolManagerContract.json");
const { ethers, BigNumber } = require("ethers");
const web3Utils = require("web3-utils");
const { MultiCall } = require("@indexed-finance/multicall");

const createRequest = async (input, callback) => {
  return performRequest({
    input,
    callback,
  });
};

const getDailyDaiRewards = async ({
  totalEnergyProducedPerDay,
  daysSearchedAsUnixTimestamps,
}) => {
  const { address, abi } = poolManagerContract;
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const multi = new MultiCall(provider);
  const multicallInputs = [];
  totalEnergyProducedPerDay.forEach((day, dayIndex) => {
    multicallInputs.push({
      target: address,
      function: "timestampToDaiToDistribute",
      args: [daysSearchedAsUnixTimestamps[dayIndex]],
    });
  });

  const dailyDaiRewards = await multi.multiCall(abi, multicallInputs);

  // [0] is the block number, [1] is the data
  return dailyDaiRewards[1];
};

const performRequest = async ({ input, callback }) => {
  const { id: jobRunID } = input;

  // Read Ceramic Network stream details from config.json
  let rawdata = fs.readFileSync("config.json");
  let config = JSON.parse(rawdata);

  const energyDataStreamId = config.streams.EnergyData.id;
  const cumulativeDaiEarningsStreamId = config.streams.CumulativeDaiEarnings.id;

  const ceramic = new CeramicClient(process.env.CERAMIC_API_URL);

  const resolver = {
    ...KeyDidResolver.getResolver(),
  };
  const did = new DID({ resolver });
  ceramic.did = did;

  // Auth
  const seed = fromString(process.env.SEED, "base16");

  const provider = new Ed25519Provider(seed);
  ceramic.did.setProvider(provider);
  await ceramic.did.authenticate();

  const dataFeedDoc = await ceramic.loadStream(energyDataStreamId);
  const sites = dataFeedDoc.content.sites || [];

  const contractStartDateIso = process.env.START_DATE_ISO;

  const startDate = parseISO(contractStartDateIso);
  const numDaysToSearch =
    differenceInDays(startOfDay(new Date()), startDate) + 1;

  const daysToSearch = new Array(numDaysToSearch)
    .fill(0)
    .map((_, index) => addDays(startDate, index));

  // Calculate total energy generated each day by all sites
  let totalEnergyProducedPerDay = new Array(numDaysToSearch).fill(0);
  let energyProducedBySitePerDay = Array.from(
    { length: numDaysToSearch },
    () => ({})
  );

  daysToSearch.forEach((day, index) => {
    sites.forEach((site) => {
      const dataWhereDateMatches = site.data.find(
        (data) => data.date === formatISO(day)
      );

      if (dataWhereDateMatches) {
        totalEnergyProducedPerDay[index] += dataWhereDateMatches.energyProduced;
        energyProducedBySitePerDay[index][site.address] =
          dataWhereDateMatches.energyProduced;
      } else {
        energyProducedBySitePerDay[index][site.address] = 0;
      }
    });
  });

  const daysSearchedAsUnixTimestamps = daysToSearch.map((day) =>
    getUnixTime(new Date(day))
  );

  const dailyDaiRewards = await getDailyDaiRewards({
    totalEnergyProducedPerDay,
    daysSearchedAsUnixTimestamps,
  });

  let cumulativeDaiEarningsBySite = {};
  energyProducedBySitePerDay.forEach(async (day, dayIndex) => {
    const dailyDaiReward = dailyDaiRewards[dayIndex];

    for (var key in day) {
      if (day.hasOwnProperty(key)) {
        if (!cumulativeDaiEarningsBySite.hasOwnProperty(key)) {
          cumulativeDaiEarningsBySite[key] = BigNumber.from(0);
        }
        cumulativeDaiEarningsBySite[key] = cumulativeDaiEarningsBySite[key].add(
          day[key]
            ? (dailyDaiReward ? dailyDaiReward : BigNumber.from(0))
                .mul(day[key])
                .div(totalEnergyProducedPerDay[dayIndex])
            : 0
        );
      }
    }
  });

  let cumulativeDaiEarningsBySiteAsArray = [];
  for (var key in cumulativeDaiEarningsBySite) {
    if (cumulativeDaiEarningsBySite.hasOwnProperty(key)) {
      const earnings = cumulativeDaiEarningsBySite[key];
      if (earnings > 0) {
        cumulativeDaiEarningsBySiteAsArray.push({
          address: key,
          earnings: cumulativeDaiEarningsBySite[key],
        });
      }
    }
  }

  const withEarningsAsHexString = cumulativeDaiEarningsBySiteAsArray.map(
    (item) => ({
      address: item.address,
      earnings: web3Utils.numberToHex(item.earnings),
    })
  );

  let toWriteToCeramic = {
    recipients: withEarningsAsHexString,
  };

  console.log(toWriteToCeramic);

  const daiEarningsDoc = await ceramic.loadStream(
    cumulativeDaiEarningsStreamId
  );
  await daiEarningsDoc.update(toWriteToCeramic);

  let root = "";

  if (withEarningsAsHexString.length > 0) {
    // Generate merkle root for earnings
    let paymentTree = new CumulativePaymentTree(withEarningsAsHexString);
    root = paymentTree.getHexRoot();
  }
  console.log(root);

  callback(
    200,
    Requester.success(jobRunID, {
      data: {
        result: root,
      },
    })
  );
};

// This is a wrapper to allow the function to work with
// GCP Functions
exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data);
  });
};

// This is a wrapper to allow the function to work with
// AWS Lambda
exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data);
  });
};

// This is a wrapper to allow the function to work with
// newer AWS Lambda implementations
exports.handlerv2 = (event, context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false,
    });
  });
};

// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest;
module.exports.performRequest = performRequest;
