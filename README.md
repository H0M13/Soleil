<p align="center"><img src="https://user-images.githubusercontent.com/6655367/143323993-1dca79f1-6716-42a2-aba0-7ec706d93207.png" width="400" height="400" /></p>

#### A project aiming to fight climate change by providing a way to incentivise growth in the entire solar industry with a single transaction. Solar energy producers are paid in stablecoins and funders are rewarded with native tokens based on the amount of energy produced.

# Architecture diagram
![Soleil architecture diagram](https://user-images.githubusercontent.com/6655367/143323919-0cba2a68-cd1f-47ce-9049-f2849d6b7da1.png)


# Build and run

## Contracts

1. Set `CHAINLINK_NODE_ADDRESS` environment variable with the address of the node which will be submitting payment merkle roots to the Pool Manager contract.
1. Set `ALCHEMY_API_KEY` and `PRIVATE_KEY` environment variables with details to allow deployment of contracts to Rinkeby.
1. Compile contracts with `npx hardhat compile`.
1. Run tests with `npx hardhat test`.
1. Grab some Rinkeby ETH from a faucet and run `npx hardhat run scripts/deploy.ts --network rinkeby`.
1. Paste the deployed pool manager contract address to /web-app/src/poolManagerContract.json.
1. Paste the deployed pool manager contract address to /dai-earnings-calculator-ea/poolManagerContract.json.

## Web-app

1. Create a Moralis server instance.
1. Set `REACT_APP_MORALIS_APPLICATION_ID` and `REACT_APP_MORALIS_SERVER_URL` environment variables for /web-app and /ceramic-soleil-data-feed-ea.
1. Set `REACT_APP_CERAMIC_API_URL` and `REACT_APP_RPC_URL` environment variables for /web-app with a Ceramic node/gateway url on the Clay testnet.
1. Run `yarn install && yarn start`.

## Ceramic-soleil-data-feed-ea

This external adapter populates the energy production data stream on Ceramic. To do this it reads the API credentials and Ethereum address for solar sites registered in the Moralis database connected to the web app and uses them to query energy production data from the monitoring API provider. Currently the only supported API provider is SolarEdge - [see their API docs here](https://www.solaredge.com/sites/default/files/se_monitoring_api.pdf). Nonsensitive energy production figures are published to the data stream alongside the site's Ethereum address.

Deploy this external adapter if you want to populate your own Ceramic data stream with energy data from solar sites which register in your Moralis database through your web app. To do so:

1. Generate a [seed](https://developers.ceramic.network/authentication/key-did/provider/#3-get-seed-for-did) for your Ceramic authentication. Set the `SEED` environment variable to this seed.
1. Set the `CERAMIC_API_URL` environment variable with a read/write node on the Ceramic Clay testnet.
1. Remember to set `REACT_APP_MORALIS_APPLICATION_ID` and `REACT_APP_MORALIS_SERVER_URL` if not already done.
1. Run `npm run bootstrap` to pin the bootstrap your Ceramic schema and data streams. Stream IDs will be written to `config.json` files in all projects which need them.
1. [Deploy the adapter to a cloud hosting solution](https://chainlinkadapters.com/guides/run-external-adapter-on-gcp) or run it locally.
1. [Create a bridge between your Chainlink node and the external adapter](https://docs.chain.link/docs/node-operators/)
1. Create a CRON job for the adapter. Here's an example:

```
type = "cron"
schemaVersion = 1
name = "data-feed-hourly-cron"
schedule = "CRON_TZ=UTC 0 0 * * * *"
observationSource = """
    fetch        [type=bridge name="YOUR_BRIDGE_NAME" requestData="{\\"id\\": \\"0\\"}"]

    fetch
"""
```

This process is currently centralised and would need to be decentralised between a number of nodes using a process similar to current [off-chain reporting](https://docs.chain.link/docs/off-chain-reporting/).

## Dai-earnings-calculator-ea

This external adapter reads total daily DAI distribution data from the pool manager smart contract and energy production data from the Ceramic data stream. It is then able to calculate how much DAI each solar site has earned and publishes this data to the cumulative DAI earnings Ceramic data stream. The merkle root of this cumulative earnings data is then returned to the Chainlink node to be submitted to the pool manager contract. Multicall is used to reduce the number of calls made to the RPC node.

1. Create a CRON job for the adapter. Here's an example:

```
type = "cron"
schemaVersion = 1
name = "dai-earnings-calculator-hourly-5-mins-offset-cron"
schedule = "CRON_TZ=UTC 0 5 * * * *"
observationSource = """
    fetch        [type=bridge name="YOUR_BRIDGE_NAME" requestData="{\\"id\\": \\"0\\"}"]
    parse        [type=jsonparse path="data,result" data="$(fetch)"]
    encode_data  [type=ethabiencode abi="submitDaiMerkleRoot(bytes32 _root)" data="{ \\"_root\\": $(parse) }"]
    submit_tx    [type=ethtx to="YOUR_POOL_MANAGER_CONTRACT_ADDRESS" data="$(encode_data)"]

    fetch -> parse -> encode_data  -> submit_tx
"""
```

## Sll-earnings-calculator-ea

This external adapter reads daily scheduled DAI distribution data from the pool manager smart contract so it can calculate the percentage each user has contributed to the total daily DAI distributions. It then reads the energy production data from the Ceramic data stream and calculates the SLL rewards per user using the following formula:

(User's daily DAI distribution * Total energy produced that day) / (1000 * Total daily DAI distribution)

The SLL rewards data is then published to the cumulative SLL earnings data stream. The merkle root of this data is then returned to the Chainlink node to be submitted to the pool manager contract. Multicall is used to reduce the number of calls made to the RPC node.

1. Create a CRON job for the adapter. Here's an example:

```
type = "cron"
schemaVersion = 1
name = "sll-rewards-calculator-hourly-5-mins-offset-cron"
schedule = "CRON_TZ=UTC 0 5 * * * *"
observationSource = """
    fetch        [type=bridge name="YOUR_BRIDGE_NAME" requestData="{\\"id\\": \\"0\\"}"]
    parse        [type=jsonparse path="data,result" data="$(fetch)"]
    encode_data  [type=ethabiencode abi="submitSllMerkleRoot(bytes32 _root)" data="{ \\"_root\\": $(parse) }"]
    submit_tx    [type=ethtx to="YOUR_POOL_MANAGER_CONTRACT_ADDRESS" data="$(encode_data)"]

    fetch -> parse -> encode_data  -> submit_tx
"""
```
