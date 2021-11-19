import { useForm, Controller } from "react-hook-form";
import { Box, Button, TextField, Typography, Theme } from "@mui/material";
import { useMoralis } from "react-moralis";
import { MonitoringProvider } from "./MonitoringProvider";

import enphase from "../../resources/images/enphase.png";
import tesla from "../../resources/images/tesla.png";
import solarEdge from "../../resources/images/solarEdge.png";
import sma from "../../resources/images/sma.png";

export const RegisterSite = () => {
  //  TODO: Either only allow registering a site when connected or add a wallet field to form

  const { handleSubmit, control, reset, formState } = useForm({
    mode: "onChange",
  });

  const { Moralis } = useMoralis();

  const { isDirty } = formState;

  const siteIdPlaceholder = "Enter your Site ID";
  const apiKeyPlaceholder = "Enter your API Key";

  const onSubmit = async (data: any) => {
    const { siteId, apiKey } = data;
    const result = await Moralis.Cloud.run("verifySiteDetails", {
      siteId,
      apiKey,
    });
    console.log(result);
  };

  const selectedSite = "SolarEdge";

  return (
    <form id="profile-form" onSubmit={handleSubmit(onSubmit)}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: "600px",
          gap: (theme: Theme) => theme.spacing(3),
        }}
      >
        <Typography variant="h4">Register your site here</Typography>
        <Typography
          variant="h5"
          sx={{
            mt: 4,
          }}
        >
          Select your monitoring provider
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: (theme: Theme) => theme.spacing(4),
          }}
        >
          <MonitoringProvider imgSrc={solarEdge} />
          <MonitoringProvider disabled imgSrc={enphase} />
          <MonitoringProvider disabled imgSrc={tesla} />
          <MonitoringProvider disabled imgSrc={sma} />
        </Box>
        <Typography
          variant="h5"
          sx={{
            display: "flex",
            flexWrap: "wrap",
            mt: 4,
          }}
        >
          Enter your&nbsp;
          <Typography
            variant="h5"
            sx={{
              fontStyle: "italic",
              color: (theme: Theme) => theme.palette.primary.main,
            }}
          >
            {selectedSite}
          </Typography>
          &nbsp;API credentials
        </Typography>
        <Controller
          render={({ field }) => (
            <TextField
              label="Site ID"
              placeholder={siteIdPlaceholder}
              {...field}
            />
          )}
          name="siteId"
          control={control}
          defaultValue={""}
        />
        <Controller
          render={({ field }) => (
            <TextField
              label="API Key"
              placeholder={apiKeyPlaceholder}
              {...field}
            />
          )}
          name="apiKey"
          control={control}
          defaultValue={""}
        />
        <Button
          variant="contained"
          disableElevation
          disabled={!isDirty}
          type="submit"
          form="profile-form"
        >
          Submit
        </Button>
      </Box>
    </form>
  );
};
