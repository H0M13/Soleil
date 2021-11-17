import ForSiteOwners from "./ForSiteOwners";
import ForStakers from "./ForStakers";
import { Box } from "@mui/material";

const Landing = () => {
  return (
		<Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: (theme) => theme.spacing(4),
        justifyContent: "space-around",
        my: {
          xs: 2,
          md: 4,
        },
      }}
    >
      <ForStakers />
      <ForSiteOwners />
    </Box>
	);
}

export default Landing;



