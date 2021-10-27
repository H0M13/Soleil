import React from "react";
import { Container, Typography } from "@mui/material";
import { AuthManager } from "./AuthManager";

export const Header = () => {
  return (
    <Container
      maxWidth="xl"
      sx={{
        display: "flex",
        justifyContent: "space-between",    
      }}
    >
      <Typography>Logo</Typography>
      <AuthManager />
    </Container>
  );
};
