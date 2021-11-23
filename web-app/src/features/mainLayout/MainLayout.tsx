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
            display: "grid",
            gridTemplateAreas: `
            "logo header ."
            "content content content"
            `,
            gridTemplateColumns: "300px auto 200px",
            gridTemplateRows: "300px auto",
          }}
        >
          <Box
            sx={{
              gridArea: "logo",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Link to="/" data-blobity-radius="130">
              <Logo />
            </Link>
          </Box>
          <Box sx={{ gridArea: "header" }}>
            <Header />
          </Box>
          <Box sx={{ gridArea: "content" }}>
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
            </Container>
            <AlertManager />
          </Box>
        </Box>
      </ThemeProvider>
    </ClaimableTokensProvider>
  );
};
