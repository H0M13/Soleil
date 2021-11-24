import { Box, Button, Alert } from "@mui/material";
import { useEffect } from "react";

interface Props {
  content: React.ReactNode;
  severity: "error" | "warning" | "info" | "success";
  onClick: Function;
  index: number;
  requiresManualDismiss?: boolean;
}

const ToastAlert = ({
  content,
  severity,
  onClick,
  index,
  requiresManualDismiss = false,
}: Props) => {
  useEffect(() => {
    if (!requiresManualDismiss) {
      const timer = setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("removeToast", { detail: { index } })
        );
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <Box
      data-no-blobity
      sx={{
        display: "inline-block",
        minWidth: "200px",
        margin: "5px",
        overflow: "hidden",
        borderRadius: "5px",
      }}
    >
      <Alert
        severity={severity}
        variant="filled"
        action={
          <Button
            data-no-blobity
            color="inherit"
            style={{ boxShadow: "none" }}
            size="small"
            onClick={() => onClick()}
          >
            CLOSE
          </Button>
        }
      >
        {content}
      </Alert>
    </Box>
  );
};

export default ToastAlert;
