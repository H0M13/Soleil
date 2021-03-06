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
const Moralis = require("moralis/node");
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

const getUsersDailyDaiDistributions = async ({
  totalEnergyProducedPerDay,
  usersEthAddresses,
  daysSearchedAsUnixTimestamps,
}) => {
  const { address, abi } = poolManagerContract;
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const multi = new MultiCall(provider);
  const multicallInputs = [];
  totalEnergyProducedPerDay.forEach((day, dayIndex) => {
    usersEthAddresses.forEach((ethAddress) => {
      const timestamp = daysSearchedAsUnixTimestamps[dayIndex];
      multicallInputs.push({
        target: address,
        function: "addressToTimestampToDaiToDistribute",
        args: [ethAddress, timestamp],
      });
    });
  });

  const rawResults = await multi.multiCall(abi, multicallInputs);

  const results = [];
  totalEnergyProducedPerDay.forEach((day, dayIndex) => {
    usersEthAddresses.forEach((ethAddress, addressIndex) => {
      const timestamp = daysSearchedAsUnixTimestamps[dayIndex];
      results.push({
        ethAddress,
        timestamp,
        daiDistribution:
          // [0] is the block number, [1] is the data
          rawResults[1][usersEthAddresses.length * dayIndex + addressIndex],
      });
    });
  });

  return results;
};

const performRequest = async ({ input, callback }) => {
  const { id: jobRunID } = input;

  // Connect to Moralis
  Moralis.start({
    serverUrl: process.env.MORALIS_SERVER_URL,
    appId: process.env.MORALIS_APPLICATION_ID,
    masterKey: process.env.MORALIS_MASTER_KEY,
  });
  const ethAddressesQuery = new Moralis.Query("_EthAddress");
  const ethAddresses = await ethAddressesQuery.find({ useMasterKey: true });
  const usersEthAddresses = ethAddresses.map((ethAddress) => ethAddress.id);

  // Read Ceramic Network stream details from config.json
  let rawdata = fs.readFileSync("config.json");
  let config = JSON.parse(rawdata);

  const energyDataStreamId = config.streams.EnergyData.id;
  const cumulativeSllEarningsStreamId = config.streams.CumulativeSllEarnings.id;

  const ceramic = new CeramicClient(process.env.CERAMIC_API_URL);

  const resolver = {
    ...KeyDidResolver.getResolver(),
  };
  const did = new DID({ resolver });
  ceramic.did = did;

  // Auth
  const seed = fromString(process.env.SEED, "base16");

  const ceramicProvider = new Ed25519Provider(seed);
  ceramic.did.setProvider(ceramicProvider);
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

  daysToSearch.forEach((day, index) => {
    sites.forEach((site) => {
      const dataWhereDateMatches = site.data.find(
        (data) => data.date === formatISO(day)
      );

      if (dataWhereDateMatches) {
        totalEnergyProducedPerDay[index] += dataWhereDateMatches.energyProduced;
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

  const usersDailyDaiDistributions = await getUsersDailyDaiDistributions({
    totalEnergyProducedPerDay,
    usersEthAddresses,
    daysSearchedAsUnixTimestamps,
  });

  let cumulativeSllEarningsByUserAsArray = [];
  usersDailyDaiDistributions.forEach((dailyDistribution) => {
    if (!dailyDistribution.daiDistribution.isZero()) {
      // The user's earned SLL equals (their daily DAI distribution * total energy generated for that day) / (1000 * total daily DAI distribution)
      const dayIndex = daysSearchedAsUnixTimestamps.indexOf(
        dailyDistribution.timestamp
      );

      const totalDailyDaiDistribution = dailyDaiRewards[dayIndex];

      const totalEnergyGeneratedThatDay = totalEnergyProducedPerDay[dayIndex];

      const tokenDenom = BigNumber.from(10).pow(18);
      const usersEarnedSll = dailyDistribution.daiDistribution
        .div(totalDailyDaiDistribution)
        .mul(tokenDenom)
        .mul(totalEnergyGeneratedThatDay)
        .div(BigNumber.from(1000));

      const existingRecord = cumulativeSllEarningsByUserAsArray.findIndex(
        (item) => item.address === dailyDistribution.ethAddress
      );
      if (existingRecord > -1) {
        cumulativeSllEarningsByUserAsArray[existingRecord].earnings =
          cumulativeSllEarningsByUserAsArray[existingRecord].earnings.add(
            usersEarnedSll
          );
      } else {
        cumulativeSllEarningsByUserAsArray.push({
          address: dailyDistribution.ethAddress,
          earnings: usersEarnedSll,
        });
      }
    }
  });

  const withEarningsAsHexString = cumulativeSllEarningsByUserAsArray.map(
    (item) => ({
      address: item.address,
      earnings: web3Utils.numberToHex(item.earnings),
    })
  );

  let toWriteToCeramic = {
    recipients: withEarningsAsHexString,
  };

  console.log(toWriteToCeramic);

  const sllEarningsDoc = await ceramic.loadStream(
    cumulativeSllEarningsStreamId
  );
  await sllEarningsDoc.update(toWriteToCeramic);

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
