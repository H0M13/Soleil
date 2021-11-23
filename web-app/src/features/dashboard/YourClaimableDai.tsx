import { useClaimableTokens } from "../../context/ClaimableTokensContext";
import { utils, BigNumber } from "ethers";
import {
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useMoralis } from "react-moralis";

export const YourClaimableDai = () => {
  const { claimableDai } = useClaimableTokens();
  const { isAuthenticated } = useMoralis();

  const formattedAmount = claimableDai
    ? utils.formatEther(BigNumber.from(claimableDai))
    : 0;

  return (
    <Card
      sx={{
        maxWidth: "400px",
      }}
    >
      <CardContent>
        <Typography variant="h5">Your claimable DAI:</Typography>
        <Typography
          variant="h3"
          sx={{
            maxWidth: "100%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {formattedAmount}
        </Typography>
      </CardContent>
      <CardActions
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <Button
          variant="contained"
          disableElevation
          component={Link}
          to="/claim"
          disabled={!isAuthenticated}
          style={{ margin: "10px 0" }}
        >
          Claim Tokens
        </Button>
      </CardActions>
    </Card>
  );
};
