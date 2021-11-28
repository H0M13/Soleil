import { useState, useEffect } from "react";
import { useClaimableTokens } from "../../context/ClaimableTokensContext";
import { utils, BigNumber } from "ethers";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Theme,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useMoralis } from "react-moralis";
import { useSoleil } from "../../context/SoleilContext";
import { ethers } from "ethers";
import { useForm, Controller } from "react-hook-form";

export const YourClaimableDai = () => {
  const { claimableDai, getUsersProofForDaiEarnings } = useClaimableTokens();
  const { isAuthenticated } = useMoralis();
  const { useExecuteSoleilFunction } = useSoleil();

  const { data, error, fetch, isFetching, isLoading } =
    useExecuteSoleilFunction();

  useEffect(() => {
    if (error !== null) {
      window.dispatchEvent(
        new CustomEvent("addToast", {
          detail: {
            content: "An error occurred",
            severity: "error",
            requiresManualDismiss: false,
          },
        })
      )
    }

    if (data !== null) {
      window.dispatchEvent(
        new CustomEvent("addToast", {
          detail: {
            content: "DAI claimed successfully",
            severity: "success",
            requiresManualDismiss: false,
          },
        })
      )
    }
  }, [data, error])

  const formattedAmount = claimableDai
    ? utils.formatEther(BigNumber.from(claimableDai))
    : 0;

  const { handleSubmit, control, reset, formState } = useForm({
    mode: "onChange",
  });
  const { isDirty } = formState;

  const onSubmit = async (data: any) => {
    const { amount } = data;

    const asSolidityNum = ethers.utils.parseUnits(amount.toString());

    const proof = await getUsersProofForDaiEarnings();

    await fetch({
      functionName: "withdrawDai",
      params: {
        _value: asSolidityNum,
        _proof: proof,
      },
    });

    // TODO:
    // refreshClaimableDai();
  };

  const toggleIsClaiming = () => {
    setIsClaiming(!isClaiming);
  };

  const [isClaiming, setIsClaiming] = useState<boolean>(false);

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
        {isClaiming && (
          <form id="dai-claim-form" onSubmit={handleSubmit(onSubmit)}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                maxWidth: "600px",
                gap: (theme: Theme) => theme.spacing(3),
              }}
            >
              <Typography
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  mt: 4,
                }}
              >
                How much DAI would you like to claim?
              </Typography>
              <Controller
                render={({ field }) => (
                  <TextField
                    label="Amount in DAI"
                    placeholder="Enter amount to claim"
                    type="number"
                    {...field}
                  />
                )}
                name="amount"
                control={control}
                defaultValue={0}
              />
              <Button
                variant="contained"
                disableElevation
                disabled={!isDirty}
                type="submit"
                form="dai-claim-form"
              >
                Submit
              </Button>
            </Box>
          </form>
        )}
      </CardContent>
      {!isClaiming && (
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
            onClick={toggleIsClaiming}
            style={{ margin: "10px 0" }}
            disabled={
              claimableDai === undefined || parseFloat(claimableDai) <= 0 || isLoading
            }
          >
            Claim Tokens
          </Button>
        </CardActions>
      )}
    </Card>
  );
};
