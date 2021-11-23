import {
  backdropClasses,
  Box,
  Container,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import { Header } from "../header/Header";
import AppRoutes from "../../utils/routes";
import useBlobity from "blobity/lib/useBlobity";
import themeOptions from "./theme";
import AlertManager from "../alerts/AlertManager";
import { Logo } from "../header/Logo";
import { Link } from "react-router-dom";
import { ClaimableTokensProvider } from "../../context/ClaimableTokensContext";

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
    <ClaimableTokensProvider>
      <ThemeProvider theme={themeOptions}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              maxWidth: "300px",
              flexShrink: 0,
            }}
          >
            <Link to="/" data-blobity-radius="130">
              <Logo />
            </Link>
          </Box>
          <Box
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              height: "100vh",
              boxSizing: "border-box",
              paddingTop: "30px",
              flexGrow: 1,
            }}
          >
            <AlertManager />
            <Header />
            <Container
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                maxWidth: "10000px !important",
                height: "100%",
              }}
            >
              <AppRoutes />
              {/* <SitesDisplay /> */}
            </Container>
          </Box>
          <Box
            sx={{
              display: "inline-block",
              flexShrink: 5,
              maxWidth: "300px",
              flexGrow: 1,
            }}
          >
            .
          </Box>
        </Box>
      </ThemeProvider>
    </ClaimableTokensProvider>
  );
};
