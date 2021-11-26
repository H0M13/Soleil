import { YourClaimableDai } from "./YourClaimableDai";
import { YourClaimableSll } from "./YourClaimableSll";
import { UsersScheduledDaiPayouts } from "./UsersScheduledDaiPayouts";
import { Box, Typography } from "@mui/material";
import React from "react";

const Dashboard = () => {
  return (
    <React.Fragment>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">Your scheduled DAI distributions</Typography>
        <Typography>(over the next 10 days)</Typography>
        <UsersScheduledDaiPayouts />
      </Box>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          justifyContent: "center",
          gap: (theme) => theme.spacing(4),
        }}
      >
        <YourClaimableDai />
        <YourClaimableSll />
      </Box>
    </React.Fragment>
  );
};

export default Dashboard;
