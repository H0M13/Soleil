import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useMoralis } from "react-moralis"

export const RegisterSite = () => {
  const { handleSubmit, control, reset, formState } = useForm({
    mode: "onChange",
  });

  const { Moralis } = useMoralis()

  const { isDirty } = formState;

  const siteIdPlaceholder = "Enter your Site ID";
  const apiKeyPlaceholder = "Enter your API Key";

  const onSubmit = async (data: any) => {
    const { siteId, apiKey } = data
    const result = await Moralis.Cloud.run("verifySiteDetails", {
        siteId,
        apiKey 
    });
    console.log(result)
  };

  return (
    <form id="profile-form" onSubmit={handleSubmit(onSubmit)}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "600px",
          gap: (theme) => theme.spacing(2),
        }}
      >
        <Typography>Register your site here</Typography>
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
