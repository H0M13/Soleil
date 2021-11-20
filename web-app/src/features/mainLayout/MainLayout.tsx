import { Box, Container, createTheme, ThemeProvider } from "@mui/material";
import { Header } from "../header/Header";
import AppRoutes from "../../utils/routes";
import useBlobity from "blobity/lib/useBlobity";
import themeOptions from "./theme";
import AlertManager from "../alerts/AlertManager";

export const MainLayout = () => {
  const options = {
    licenseKey: "opensource",
    color: "rgb(235, 64, 52)",
    dotColor: "rgb(255, 255, 255)",
    focusableElementsOffsetX: 8,
    focusableElementsOffsetY: 8,
  };
  useBlobity(options);

  return (
    <ThemeProvider theme={themeOptions}>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          padding: "10px",
          height: "100vh",
          width: "100%",
          boxSizing: "border-box"
        }}
      >
        <AlertManager />
        <Header />
        <Container
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <AppRoutes />
            {/* <SitesDisplay /> */}
          </Container>
      </Box>
    </ThemeProvider>
  );
};
