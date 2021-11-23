import React from "react";
import { Button, Box, Theme, Typography } from "@mui/material";
import { useMoralis } from "react-moralis";
import PersonIcon from "@mui/icons-material/Person";
import { Link } from "react-router-dom";

export const AuthManager = () => {
  const { authenticate, isAuthenticated, isAuthenticating, logout, user } =
    useMoralis();

  if (isAuthenticated) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: (theme: Theme) => theme.spacing(2),
        }}
      >
        <PersonIcon />
        <Typography>{`${user?.attributes.ethAddress.slice(
          0,
          8
        )}...`}</Typography>
        <Button
          variant="contained"
          disableElevation
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent("addToast", {
                detail: {
                  text: "Successfully logged out",
                  severity: "success",
                },
              })
            );
            logout();
          }}
        >
          Logout
        </Button>
        <Button variant="contained" disableElevation component={Link} to="/dashboard">
          Dashboard
        </Button>
      </Box>
    );
  }

  const handleConnect = async () => {
    await authenticate();
  };

  return (
    <Button
      variant="contained"
      disableElevation
      disabled={isAuthenticating}
      onClick={handleConnect}
    >
      Connect
    </Button>
  );
};
