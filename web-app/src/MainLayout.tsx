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
import { Routes, Route } from "react-router-dom";

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
    typography: {
      fontFamily: "'Source Code Pro', monospace",
      fontWeightRegular: 600,
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
            backgroundColor: "transparent",
            border: "1px solid black",
            color: "rgb(27, 116, 242)",
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
          <Container
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Routes>
              <Route
                path="/"
                element={
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: (theme) => theme.spacing(4),
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
                }
              />
              <Route path="register-site" element={<RegisterSite />} />
            </Routes>
            {/* <SitesDisplay /> */}
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
