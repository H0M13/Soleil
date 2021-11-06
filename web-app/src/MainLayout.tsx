import React from "react";
import { Box, Container, createTheme, ThemeProvider } from "@mui/material";
import {
  Header,
  SitesDisplay,
  RegisterSite,
  ForStakers,
  ForSiteOwners,
} from "./features";
import useBlobity from "blobity/lib/useBlobity";

export const MainLayout = () => {
  const options = {
    licenseKey: "opensource",
    color: "rgb(235, 64, 52)",
    dotColor: "rgb(255, 255, 255)",
    focusableElementsOffsetX: 8,
    focusableElementsOffsetY: 8,
  };
  useBlobity(options);

  const themeOptions = createTheme({
    palette: {
      primary: {
        main: "rgb(27, 116, 242)",
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
      borderRadius: 0,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            boxShadow: "10px 10px black",
          },
          containedPrimary: {
            "&:hover": {
              backgroundColor: "rgb(27, 116, 242)",
              cursor: "unset",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: "10px 10px black",
          },
        },
      },
    },
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
        }}
      >
        <Box
          sx={{
            p: {
              xs: 1,
              md: 2,
            },
            height: "fit-content",
          }}
        >
          <Header />
        </Box>
        <Box
          sx={{
            flex: "auto",
          }}
        >
          <Container>
            <Box
              sx={{
                display: "flex",
                gap: (theme) => theme.spacing(2),
                justifyContent: "space-around",
                my: {
                  xs: 2,
                  md: 4,
                },
              }}
            >
              <ForStakers />
              <ForSiteOwners />
            </Box>
            <SitesDisplay />
            <RegisterSite />
          </Container>
        </Box>
        <Box
          sx={{
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
