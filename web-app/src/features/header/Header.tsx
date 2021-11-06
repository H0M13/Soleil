import React from "react";
import { Container } from "@mui/material";
import { AuthManager } from "./AuthManager";
import { Logo } from "./Logo"

export const Header = () => {
  return (
    <Container
      maxWidth="xl"
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start"    
      }}
    >
      <Logo />
      <AuthManager />
    </Container>
  );
};
