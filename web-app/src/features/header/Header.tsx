import React from "react";
import { Container, Button } from "@mui/material";
import { AuthManager } from "./AuthManager";
import { Logo } from "./Logo";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <Container
      maxWidth="xl"
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <Button
        variant="contained"
        disableElevation
        component={Link}
        to="/"
        style={{margin: '0'}}
      >
        Home
      </Button>
      <div style={{flexGrow: 1}}/>
      <AuthManager />
    </Container>
  );
};
