import React from "react";
import { Container } from "@mui/material";
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
      <Link to="/" data-blobity-radius="130">
        <Logo />
      </Link>
      <AuthManager />
    </Container>
  );
};
