import ForSiteOwners from "./ForSiteOwners";
import ForGreenUsers from "./ForGreenUsers";
import { DaiBalance } from "./DaiBalance";
import { UsersScheduledDaiPayouts } from "./UsersScheduledDaiPayouts";
import { LeftStats, RightStats } from "../stats/StatsContainer";

import { Box, Theme } from "@mui/material";
import React from "react";

const Landing = () => {
  return (
    <React.Fragment
      // style={{
      //   backgroundColor: 'purple',
      //   height: '100%',
      //   width: '100%'
      // }}
    >
      {/* <DaiBalance /> */}
      {/* <UsersScheduledDaiPayouts /> */}

      <Box
        sx={{
          display: "flex",
          width: '100%',
        }}
      >
        <LeftStats />
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
        <RightStats />
      </Box>
    </React.Fragment>
  );
};

export default Landing;
