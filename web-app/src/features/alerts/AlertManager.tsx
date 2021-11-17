import { Box } from "@mui/material";
import ToastAlert from "./ToastAlert";

const AlertManager = () => {
  return (
    <Box
      sx={{
        position: "absolute",
        display: "inline-flex",
        flexDirection: "column",
        maxWidth: "90%",
        right: 0,
        bottom: 0,
      }}
    >
      <ToastAlert text="test" severity="error" />
      <ToastAlert text="test" severity="warning" />
      <ToastAlert text="test" severity="info" />
      <ToastAlert text="test" severity="success" />
    </Box>
  );
}

export default AlertManager;

