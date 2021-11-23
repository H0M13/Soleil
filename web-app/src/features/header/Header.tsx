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
        justifyContent: "flex-end",
        alignItems: "flex-start",
        marginTop: "40px"
      }}
    >
      {/* <Button
        variant="contained"
        disableElevation
        component={Link}
        to="/"
      >
        Home
      </Button> */}
      <AuthManager />
    </Container>
  );
};
