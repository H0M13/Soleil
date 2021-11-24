import { YourClaimableDai } from "./YourClaimableDai";
import { YourClaimableSll } from "./YourClaimableSll";
import { Box } from "@mui/material";
import React from "react";

const Dashboard = () => {
  return (
    <React.Fragment>
      <Box
        sx={{
          display: "flex",
          width: "100%",
        }}
      >
          <YourClaimableDai />
          <YourClaimableSll />
      </Box>
    </React.Fragment>
  );
};

export default Dashboard;
