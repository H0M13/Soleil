import { useForm, Controller } from "react-hook-form";
import { Box, Button, CircularProgress, TextField, Typography, Theme } from "@mui/material";
import { ethers } from "ethers";
import { useSoleil } from "../../context/SoleilContext";
import { useMoralis } from "react-moralis";
import PleaseConnect from '../pleaseConnect/PleaseConnect';
import { useEffect } from "react"

const LoadingIndicator = ({ label }: { label: string }) => {
  return <Box sx={{
    display: "flex",
    alignItems: "center",
    gap: (theme) => theme.spacing(1),
    marginTop: (theme) => theme.spacing(1)
  }}
  >
    <CircularProgress size={20} />
    <Typography>{label}</Typography>
  </Box>
}

export const SubmitFunds = () => {
  const {
    poolManagerContractAddress,
    useExecuteSoleilFunction,
    useExecuteDaiFunction,
  } = useSoleil();

  // { data, error, fetch, isFetching, isLoading }
  const executeSoleilFunctionVariables = useExecuteSoleilFunction();
  const executeDaiFunctionVariables = useExecuteDaiFunction();

  const { handleSubmit, control, reset, formState } = useForm({
    mode: "onChange",
  });

  const { isAuthenticated } = useMoralis();

  const { isDirty } = formState;

  const daiAmountPlaceholder = "Enter amount in DAI";
  const numDaysPlaceholder = "Enter number of days";

  useEffect(() => {
    if (executeSoleilFunctionVariables.error !== null) {
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

    if (executeSoleilFunctionVariables.data !== null) {
      window.dispatchEvent(
        new CustomEvent("addToast", {
          detail: {
            content: "DAI distribution created successfully",
            severity: "success",
            requiresManualDismiss: false,
          },
        })
      )
    }
  }, [executeSoleilFunctionVariables.data, executeSoleilFunctionVariables.error])

  const onSubmit = async (data: any) => {
    const { amount, numDays } = data;

    const asSolidityNum = ethers.utils.parseUnits(amount.toString());

    await executeDaiFunctionVariables.fetch({
      functionName: "approve",
      params: {
        _spender: poolManagerContractAddress,
        _value: asSolidityNum,
      },
    });

    await executeSoleilFunctionVariables.fetch({
      functionName: "setDaiPayoutSchedule",
      params: {
        _amount: asSolidityNum,
        _numOfDays: numDays,
      },
    });
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
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <Button
            variant="contained"
            disableElevation
            disabled={!isDirty || executeDaiFunctionVariables.isLoading || executeSoleilFunctionVariables.isLoading}
            type="submit"
            form="donation-form"
          >
            Submit
        </Button>
          {
            executeDaiFunctionVariables.isLoading && <LoadingIndicator label="Approving" />
          }
          {
            executeSoleilFunctionVariables.isLoading && <LoadingIndicator label="Submitting" />
          }
        </Box>
      </Box>
    </form>
  );
};
