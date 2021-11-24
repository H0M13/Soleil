import { useForm, Controller } from "react-hook-form";
import { Box, Button, TextField, Typography, Theme } from "@mui/material";
import { useMoralis } from "react-moralis";
import PleaseConnect from "../pleaseConnect/PleaseConnect";
import { useSoleil } from "../../context/SoleilContext";
import { useClaimableTokens } from "../../context/ClaimableTokensContext";
import { ethers } from "ethers";

export const ClaimDai = () => {
  const {
    useExecuteSoleilFunction,
  } = useSoleil();

  const { getUsersProofForDaiEarnings } = useClaimableTokens()

  const { data, error, fetch, isFetching, isLoading } =
    useExecuteSoleilFunction();

  const { isAuthenticated } = useMoralis();

  const { handleSubmit, control, reset, formState } = useForm({
    mode: "onChange",
  });

  const { isDirty } = formState;

  const onSubmit = async (data: any) => {
    const { amount } = data;

    const asSolidityNum = ethers.utils.parseUnits(amount.toString());

    const proof = await getUsersProofForDaiEarnings()

    await fetch({
      functionName: "withdrawDai",
      params: {
        _value: asSolidityNum,
        _proof: proof
      },
    });

    // TODO:
    // refreshClaimableDai();
  };

  if (!isAuthenticated) {
    return <PleaseConnect />;
  }

  return (
    <form id="donation-form" onSubmit={handleSubmit(onSubmit)}>
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
          variant="h5"
          sx={{
            display: "flex",
            flexWrap: "wrap",
            mt: 4,
          }}
        >
          How much DAI would you like to withdraw?
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
          form="donation-form"
        >
          Submit
        </Button>
      </Box>
    </form>
  );
};
