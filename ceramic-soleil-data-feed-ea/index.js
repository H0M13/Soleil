const { Requester } = require("@chainlink/external-adapter");
const fs = require("fs");
const { CeramicClient } = require("@ceramicnetwork/http-client");
const KeyDidResolver = require("key-did-resolver");
const { DID } = require("dids");
const { Ed25519Provider } = require("key-did-provider-ed25519");
const { fromString } = require("uint8arrays/from-string");
const Moralis = require("moralis/node");
const startOfDay = require("date-fns/startOfDay");
const formatISO = require("date-fns/formatISO");
const axios = require("axios").default;

const createRequest = async (input, callback) => {
  return performRequest({
    input,
    callback,
  });
};

const performRequest = async ({ input, callback }) => {
  const { id: jobRunID } = input;

  // Connect to Moralis
  Moralis.initialize(process.env.MORALIS_APP_ID);
  Moralis.serverURL = process.env.MORALIS_SERVER_URL;
  const siteQuery = new Moralis.Query("Site");
  const sites = await siteQuery.find();

  const overviewPromises =
    sites &&
    sites.map((site) => {
      return axios
        .get(
          `https://monitoringapi.solaredge.com/site/${site.attributes.siteId}/overview?api_key=${site.attributes.apiKey}`
        )
        .then(function (httpResponse) {
          return httpResponse.data;
        });
    });

  const DELAY_PER_REQUEST = 1000;

  const appendDelayToPromise = (promise, delayInMs) =>
    promise.then(
      (value) =>
        new Promise((resolve) => setTimeout(() => resolve(value), delayInMs))
    );

  const requestsWithDelay = overviewPromises.map((overviewPromise, index) =>
    appendDelayToPromise(overviewPromise, index * DELAY_PER_REQUEST)
  );

  const overviews = await Promise.all(requestsWithDelay);

  const energyDatas = overviews.map((overview, index) => {
    const overviewData = overview.overview;
    const lastDayEnergy = overviewData?.lastDayData?.energy;
    const date = formatISO(startOfDay(new Date()));
    const siteAddress = sites[index].attributes.address;

    return {
      address: siteAddress,
      data: {
        date,
        energyProduced: parseFloat(lastDayEnergy),
      },
    };
  });

  // Read Ceramic Network stream details from config.json
  let rawdata = fs.readFileSync("config.json");
  let config = JSON.parse(rawdata);

  const streamId = config.streams.EnergyData.id;

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

  const doc1 = await ceramic.loadStream(streamId);

  let newContent = {
    sites: doc1.content.sites || [],
  };
  energyDatas.forEach((energyData) => {
    const existingSiteIndex = newContent.sites.findIndex(
      (site) => site.address.toLowerCase() === energyData.address.toLowerCase()
    );
    if (existingSiteIndex > -1) {
      const existingDateEntryIndex = newContent.sites[existingSiteIndex].data.findIndex(
        (data) => data.date === energyData.data.date
      );
      if (existingDateEntryIndex > -1) {
        // Entry for this site and date already exists. Replace it.
        newContent.sites[existingSiteIndex].data[
          existingDateEntryIndex
        ].energyProduced = energyData.data.energyProduced;
      } else {
        newContent.sites[existingSiteIndex].data.push(energyData.data);
      }
    } else {
      newContent.sites.push({
        address: energyData.address,
        data: [
          energyData.data
        ]
      });
    }
  });

  console.log(JSON.stringify(newContent))

  await doc1.update(newContent);

  callback(200, Requester.success(jobRunID, {
    data: {
      result: {
        success: true
      }
    }
  }));
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
