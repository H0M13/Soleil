const { writeFile } = require("fs").promises;
const { CeramicClient } = require("@ceramicnetwork/http-client");
const KeyDidResolver = require("key-did-resolver");
const { DID } = require("dids");
const { Ed25519Provider } = require("key-did-provider-ed25519");
const { TileDocument } = require("@ceramicnetwork/stream-tile");
const { fromString } = require("uint8arrays/from-string");
require("dotenv").config();

// Create schema
const energyDataSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "EnergyData",
  type: "object",
  properties: {
    sites: {
      type: "array",
      items: { $ref: "#/$defs/site" },
    },
  },
  $defs: {
    site: {
      type: "object",
      required: ["address"],
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
  const deployedSchema = await TileDocument.create(
    ceramic,
    energyDataSchema,
    metadata
  );

  // Create TileDocument
  const doc = await TileDocument.create(ceramic, null, {
    controllers: [ceramic.did.id],
    schema: deployedSchema.commitId.toString(),
  });

  // Write config to JSON file
  const config = {
    schemas: {
      EnergyData: {
        url: deployedSchema.commitId.toUrl(),
        id: deployedSchema.commitId.toString(),
      },
    },
    streams: {
      EnergyData: {
        url: doc.id.toUrl(),
        id: doc.id.toString(),
      },
    },
  };
  await writeFile("./config.json", JSON.stringify(config));

  console.log("Config written to config.json file:", config);
  process.exit(0);
}

run().catch(console.error);
