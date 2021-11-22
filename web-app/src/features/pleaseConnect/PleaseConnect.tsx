import React from "react";
import {
  Card,
  CardContent,
  Typography,
} from "@mui/material";

const PleaseConnect = () => {
  return (
    <Card
      sx={{
        maxWidth: "400px",
      }}
    >
      <CardContent>
        <Typography variant="h5">Please connect your wallet to continue</Typography>
      </CardContent>
    </Card>
  );
};

export default PleaseConnect;
