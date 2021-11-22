import { Box, Container, createTheme, ThemeProvider } from "@mui/material";
import { Header } from "../header/Header";
import AppRoutes from "../../utils/routes";
import useBlobity from "blobity/lib/useBlobity";
import themeOptions from "./theme";
import AlertManager from "../alerts/AlertManager";
import { Logo } from "../header/Logo";
import { Link } from "react-router-dom";

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
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: 'flex-end',
            width: '450px',
            paddingTop: '30px'
          }}
        >
          <Link
            to="/"
            data-blobity-radius="130"
          >
            <Logo />
          </Link>
        </Box>
        <Box
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            padding: "10px",
            height: "100vh",
            width: "100%",
            boxSizing: "border-box",
            paddingTop: '30px'
          }}
        >
          <AlertManager />
          <Header />
          <Container
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: '100%',
                justifyContent: 'center'
              }}
            >
              <AppRoutes />
              {/* <SitesDisplay /> */}
            </Container>
        </Box>
        <Box
          sx={{
            width: "450px",
            textAlign: 'center',
          }}
        />
      </Box>
    </ThemeProvider>
  );
};
