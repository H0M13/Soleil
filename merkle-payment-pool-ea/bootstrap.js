const { writeFile } = require("fs").promises;
const { CeramicClient } = require("@ceramicnetwork/http-client");
const KeyDidResolver = require("key-did-resolver");
const { DID } = require("dids");
const { Ed25519Provider } = require("key-did-provider-ed25519");
const { TileDocument } = require("@ceramicnetwork/stream-tile");
const { fromString } = require("uint8arrays/from-string");
require("dotenv").config();

// Create schemas
const energyDataSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "EnergyData",
  type: "object",
  required: ["sites"],
  properties: {
    sites: {
      type: "array",
      items: { $ref: "#/$defs/site" },
    },
    earningsStreams: {
      type: "array",
      items: { $ref: "#/$defs/earningsStream" },
    }
  },
  $defs: {
    site: {
      type: "object",
      required: ["address", "data"],
      properties: {
        address: {
          type: "string",
        },
        data: {
          type: "array",
          items: { $ref: "#/$defs/energyDatum" },
        },
      },
    },
    energyDatum: {
      type: "object",
      properties: {
        date: {
          type: "string",
        },
        energyProduced: {
          type: "number",
        },
      },
      required: ["date", "energyProduced"],
    },
    earningsStream: {
      type: "object",
      properties: {
        date: {
          type: "string",
        },
        streamId: {
          type: "string",
        },
      },
      required: ["date", "streamId"],
    }
  },
};

const cumulativeEarningsDataSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "EnergyData",
  type: "object",
  required: ["sites"],
  properties: {
    sites: {
      type: "array",
      items: { $ref: "#/$defs/site" },
    },
  },
  $defs: {
    site: {
      type: "object",
      required: ["address", "earnings"],
      properties: {
        address: {
          type: "string",
        },
        earnings: {
          type: "number",
        },
      },
    },
  },
};

async function run() {
  const ceramic = new CeramicClient(process.env.CERAMIC_API_URL);

  const resolver = {
    ...KeyDidResolver.getResolver(),
  };
  const did = new DID({ resolver });
  ceramic.did = did;

  // Auth
  console.log(process.env.SEED);
  const seed = fromString(process.env.SEED, "base16");
  console.log("seed: " + JSON.stringify(seed));

  const provider = new Ed25519Provider(seed);
  ceramic.did.setProvider(provider);
  await ceramic.did.authenticate();

  const metadata = {
    controllers: [ceramic.did.id], // this will set yourself as the controller of the schema
  };
  const deployedEnergyDataSchema = await TileDocument.create(
    ceramic,
    energyDataSchema,
    metadata
  );
  const deployedCumulativeEarningsDataSchema = await TileDocument.create(
    ceramic,
    cumulativeEarningsDataSchema,
    metadata
  );

  // Create TileDocuments
  const energyDataDoc = await TileDocument.create(
    ceramic,
    {
      sites: [],
      earningsStreams: []
    },
    {
      controllers: [ceramic.did.id],
      schema: deployedEnergyDataSchema.commitId.toString(),
    }
  );
  const daiEarningsDoc = await TileDocument.create(
    ceramic,
    {
      sites: [],
    },
    {
      controllers: [ceramic.did.id],
      schema: deployedCumulativeEarningsDataSchema.commitId.toString(),
    }
  );
  const sllEarningsDoc = await TileDocument.create(
    ceramic,
    {
      sites: [],
    },
    {
      controllers: [ceramic.did.id],
      schema: deployedCumulativeEarningsDataSchema.commitId.toString(),
    }
  );

  // Write config to JSON file
  const config = {
    schemas: {
      EnergyData: {
        url: deployedEnergyDataSchema.commitId.toUrl(),
        id: deployedEnergyDataSchema.commitId.toString(),
      },
      CumulativeEarningsData: {
        url: deployedCumulativeEarningsDataSchema.commitId.toUrl(),
        id: deployedCumulativeEarningsDataSchema.commitId.toString(),
      },
    },
    streams: {
      EnergyData: {
        url: energyDataDoc.id.toUrl(),
        id: energyDataDoc.id.toString(),
      },
      CumulativeDaiEarnings: {
        url: daiEarningsDoc.id.toUrl(),
        id: daiEarningsDoc.id.toString(),
      },
      CumulativeSllEarnings: {
        url: sllEarningsDoc.id.toUrl(),
        id: sllEarningsDoc.id.toString(),
      },
    },
  };
  await writeFile("./config.json", JSON.stringify(config));

  console.log("Config written to config.json file:", config);
  process.exit(0);
}

run().catch(console.error);
