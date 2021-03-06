import ForSiteOwners from "./ForSiteOwners";
import ForGreenUsers from "./ForGreenUsers";
import { LeftStats, RightStats } from "../stats/StatsContainer";
import { Box, Theme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import Moralis from "moralis";
import { useContractCall } from "@usedapp/core";
import { utils } from "ethers";
import soleilContract from "../../poolManagerContract.json";

const Landing = () => {
  const { Moralis, isInitialized, user } = useMoralis();

  const [numOfSites, setNumOfSites] = useState<number>();
  useEffect(() => {
    const getNumOfSites = async () => {
      const sitesQuery = new Moralis.Query("Site");
      const results = await sitesQuery.find();
      setNumOfSites(results.length);
    };
    isInitialized && getNumOfSites();
  }, [isInitialized]);

  const [aggregates, setAggregates] = useState<Moralis.Attributes>();
  useEffect(() => {
    const getAggregates = async () => {
      const aggregatesQuery = new Moralis.Query("AggregateSnapshot");
      aggregatesQuery.descending("createdAt");
      const result = await aggregatesQuery.first();
      setAggregates(
        result?.attributes
          ? result.attributes
          : { allTimeEnergyGenerated: 0, todayEnergyGenerated: 0 }
      );
    };
    isInitialized && getAggregates();
  }, [isInitialized]);

  const secondsSinceEpoch = Math.round(new Date().getTime() / 1000);
  const secondsInDay = 86400;
  const fullDaysSinceEpoch = Math.floor(secondsSinceEpoch / secondsInDay);

  const rawTodaysScheduledDaiPayout = useContractCall({
    abi: new utils.Interface(soleilContract.abi),
    address: soleilContract.address,
    method: "timestampToDaiToDistribute",
    args: [(fullDaysSinceEpoch * secondsInDay).toString()],
  });
  const todaysScheduledDaiPayout =
    rawTodaysScheduledDaiPayout &&
    utils.formatEther(rawTodaysScheduledDaiPayout.toString());

  const rawWithdrawnDaiTokens = useContractCall({
    abi: new utils.Interface(soleilContract.abi),
    address: soleilContract.address,
    method: "withdrawnDaiTokens",
    args: [],
  });
  const withdrawnDaiTokens =
    rawWithdrawnDaiTokens &&
    utils.formatEther(rawWithdrawnDaiTokens.toString());

  const rawWithdrawnSllTokens = useContractCall({
    abi: new utils.Interface(soleilContract.abi),
    address: soleilContract.address,
    method: "withdrawnSllTokens",
    args: [],
  });
  const withdrawnSllTokens =
    rawWithdrawnSllTokens &&
    utils.formatEther(rawWithdrawnSllTokens.toString());

  const stats = {
    numOfSites,
    aggregates,
    todaysScheduledDaiPayout,
    withdrawnDaiTokens,
    withdrawnSllTokens,
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      <LeftStats stats={stats} />
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: (theme: Theme) => theme.spacing(4),
          justifyContent: "space-around",
          my: {
            xs: 2,
            md: 4,
          },
        }}
      >
        <ForGreenUsers />
        <ForSiteOwners />
      </Box>
      <RightStats stats={stats} />
    </Box>
  );
};

export default Landing;
