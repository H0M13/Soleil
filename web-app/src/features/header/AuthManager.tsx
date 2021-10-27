import React from "react";
import { Button } from "@mui/material";
import { useMoralis } from "react-moralis";

export const AuthManager = () => {
  const { authenticate, isAuthenticated, isAuthenticating, logout } = useMoralis();

  if (isAuthenticated) {
    return (
      <Button variant="contained" onClick={logout}>
        Logout
      </Button>
    );
  }

  const handleConnect = async () => {
    await authenticate();
  };

  return (
    <Button variant="contained" disabled={isAuthenticating} onClick={handleConnect}>
      Connect
    </Button>
  );
};
