import ForSiteOwners from "./ForSiteOwners";
import ForGreenUsers from "./ForGreenUsers";
import { DaiBalance } from "./daiBalance";

import { Box, Theme } from "@mui/material";

const Landing = () => {
  return (
    <>
      <DaiBalance />
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
    </>
  );
};

export default Landing;
