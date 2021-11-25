import ForSiteOwners from "./ForSiteOwners";
import ForGreenUsers from "./ForGreenUsers";
import { LeftStats, RightStats } from "../stats/StatsContainer";
import { Box, Theme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import Moralis from "moralis";

const Landing = () => {
  const { Moralis, isInitialized } = useMoralis();

  const [aggregates, setAggregates] = useState<Moralis.Attributes>();
  useEffect(() => {
    const getAggregates = async () => {
      const aggregatesQuery = new Moralis.Query("AggregateSnapshot");
      const result = await aggregatesQuery.first();
      setAggregates(result?.attributes);
    };
    isInitialized && getAggregates();
  }, [isInitialized]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      <LeftStats stats={aggregates} />
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
      <RightStats stats={aggregates} />
    </Box>
  );
};

export default Landing;
