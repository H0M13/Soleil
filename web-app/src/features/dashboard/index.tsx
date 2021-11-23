import { YourClaimableDai } from "./YourClaimableDai";
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
      </Box>
    </React.Fragment>
  );
};

export default Dashboard;
