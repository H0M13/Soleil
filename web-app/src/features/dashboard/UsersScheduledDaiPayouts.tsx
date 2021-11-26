import { useMoralis } from "react-moralis";
import { useContractCalls } from "@usedapp/core";
import soleilContract from "../../poolManagerContract.json";
import { utils, BigNumber } from "ethers";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import ScheduledDaiPayoutsBarStack from "./ScheduledDaiPayoutsBarStack";
import { Box } from "@mui/material";
import { formatISO, fromUnixTime } from "date-fns";

export const UsersScheduledDaiPayouts = () => {
  const { user } = useMoralis();

  const secondsSinceEpoch = Math.round(new Date().getTime() / 1000);
  const secondsInDay = 86400;
  const fullDaysSinceEpoch = Math.floor(secondsSinceEpoch / secondsInDay);

  // multicall on next 10 days of user's DAI distribution schedule
  let timestamps: number[] = [];
  for (let i = 0; i < 10; i++) {
    timestamps.push((fullDaysSinceEpoch + i) * secondsInDay);
  }

  const usersResults =
    useContractCalls(
      timestamps.map((timestamp) => ({
        abi: new utils.Interface(soleilContract.abi),
        address: soleilContract.address,
        method: "addressToTimestampToDaiToDistribute",
        args: [user?.attributes.ethAddress, timestamp.toString()],
      }))
    ) ?? [];

  const usersResultsWithTimestamps = usersResults.map((result, index) => ({
    dai: result?.toString() || "0",
    timestamp: timestamps[index],
  }));

  const totalResults =
    useContractCalls(
      timestamps.map((timestamp) => ({
        abi: new utils.Interface(soleilContract.abi),
        address: soleilContract.address,
        method: "timestampToDaiToDistribute",
        args: [timestamp.toString()],
      }))
    ) ?? [];

  const totalResultsWithTimestamps = totalResults.map((result, index) => ({
    dai: result?.toString() || "0",
    timestamp: timestamps[index],
  }));

  const data = totalResultsWithTimestamps.map((totalResult, index) => {
    const date = formatISO(fromUnixTime(totalResult.timestamp), {
      representation: "date",
    });
    // @ts-ignore
    const yourDistribution = BigNumber.from(
      usersResultsWithTimestamps && usersResultsWithTimestamps[index]
        ? usersResultsWithTimestamps[index].dai
        : 0
    );
    const totalDistribution = BigNumber.from(totalResult.dai);
    const restDistribution = totalDistribution.sub(yourDistribution);

    return {
      "By you": utils.formatEther(yourDistribution),
      "By others": utils.formatEther(restDistribution),
      date,
    };
  });

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "600px",
        height: "400px",
      }}
    >
      <ParentSize>
        {({ width, height }) => (
          <ScheduledDaiPayoutsBarStack
            width={width}
            height={height}
            data={data}
          />
        )}
      </ParentSize>
    </Box>
  );
};
