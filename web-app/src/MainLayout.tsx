import React from "react";
import { Box, Container, createTheme, ThemeProvider } from "@mui/material";
import { Header } from "./features/header";

export const MainLayout = () => {
  const themeOptions = createTheme({
    palette: {
      primary: {
        main: "#6ce8d2",
      },
      secondary: {
        main: "#4493cf",
      },
      background: {
        default: "#f5d312",
        paper: "#f2f2f2",
      },
      text: {
        primary: "#262a31",
        secondary: "#383c4a",
      },
    },
    shape: {
        borderRadius: 0
    },
    // components: {
    //   // Name of the component
    //   MuiButton: {
    //     styleOverrides: {
    //       // Name of the slot
    //       root: {
    //         // Some CSS
    //         fontSize: "1rem",
    //       },
    //     },
    //   },
    // },
  });

  return (
    <ThemeProvider theme={themeOptions}>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "background.default",
        }}
      >
        <Box
          sx={{
            backgroundColor: "transparent",
            p: {
              xs: 1,
              md: 2,
            },
            height: "70px",
          }}
        >
          <Header />
        </Box>
        <Box
          sx={{
            flex: "auto",
          }}
        >
          <Container />
        </Box>
        <Box
          sx={{
            backgroundColor: "transparent",
            p: {
              xs: 1,
              md: 2,
            },
            height: "70px",
          }}
        />
      </Box>
    </ThemeProvider>
  );
};
