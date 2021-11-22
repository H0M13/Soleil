import { useForm, Controller } from "react-hook-form";
import { Box, Button, TextField, Typography, Theme } from "@mui/material";
import { ethers } from "ethers";
import { useSoleil } from "../../context/SoleilContext";
import { useMoralis } from "react-moralis";
import PleaseConnect from '../pleaseConnect/PleaseConnect';

export const SubmitFunds = () => {
  const {
    poolManagerContractAddress,
    useExecuteSoleilFunction,
    useExecuteDaiFunction,
  } = useSoleil();

  // { data, error, fetch, isFetching, isLoading }
  const executeSoleilFunctionVariables = useExecuteSoleilFunction();
  const executeDaiFunctionVariables = useExecuteDaiFunction();

  //  TODO: Either only allow donating when connected or add a wallet field to form

  const { handleSubmit, control, reset, formState } = useForm({
    mode: "onChange",
  });

  const { isAuthenticated } = useMoralis();

  const { isDirty } = formState;

  const daiAmountPlaceholder = "Enter amount in DAI";
  const numDaysPlaceholder = "Enter number of days";

  const onSubmit = async (data: any) => {
    const { amount, numDays } = data;

    const asSolidityNum = ethers.utils.parseUnits(amount.toString());

    console.log(asSolidityNum);
    console.log(numDays);

    const daiResult = await executeDaiFunctionVariables.fetch({
      functionName: "approve",
      params: {
        _spender: poolManagerContractAddress,
        _value: asSolidityNum,
      },
    });

    console.log(daiResult);

    const soleilResult = await executeSoleilFunctionVariables.fetch({
      functionName: "setDaiPayoutSchedule",
      params: {
        _amount: asSolidityNum,
        _numOfDays: numDays,
      },
    });

    console.log(soleilResult);
  };

  if (!isAuthenticated) {
    return (
      <PleaseConnect />
    );
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
          How much DAI would you like to submit to the pool?
        </Typography>
        <Controller
          render={({ field }) => (
            <TextField
              label="Amount in DAI"
              placeholder={daiAmountPlaceholder}
              type="number"
              {...field}
            />
          )}
          name="amount"
          control={control}
          defaultValue={0}
        />
        <Typography
          variant="h5"
          sx={{
            display: "flex",
            flexWrap: "wrap",
            mt: 4,
          }}
        >
          Over how many days would you like it to be distributed out? This may
          affect the total amount of SLL rewarded to you.
        </Typography>
        <Controller
          render={({ field }) => (
            <TextField
              label="Number of days"
              placeholder={numDaysPlaceholder}
              type="number"
              {...field}
            />
          )}
          name="numDays"
          control={control}
          defaultValue={100}
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
