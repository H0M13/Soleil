import { useMoralis } from "react-moralis";
import { useContractCalls } from "@usedapp/core";
import soleilContract from "../../poolManagerContract.json";
import { utils } from "ethers";

export const UsersScheduledDaiPayouts = () => {
  const { user } = useMoralis();

  const secondsSinceEpoch = Math.round(new Date().getTime() / 1000);
  const secondsInDay = 86400;
  const fullDaysSinceEpoch = Math.floor(secondsSinceEpoch / secondsInDay);

  // multicall on next 100 days of user's DAI distribution schedule
  let timestamps: number[] = [];
  for (let i = 0; i < 100; i++) {
    timestamps.push((fullDaysSinceEpoch + i) * secondsInDay);
  }

  const results =
    useContractCalls(
      timestamps.map((timestamp) => ({
        abi: new utils.Interface(soleilContract.abi),
        address: soleilContract.address,
        method: "addressToTimestampToDaiToDistribute",
        args: [user?.attributes.ethAddress, timestamp.toString()],
      }))
    ) ?? [];

  const withTimestamps = results.map((result, index) => ({
    dai: result?.toString() || "0",
    timestamp: timestamps[index],
  }));

  return <span>{JSON.stringify(withTimestamps)}</span>;
};
