import { Box, Alert } from "@mui/material";
import { useEffect } from "react";

interface Props {
  text: string;
  severity: "error" | "warning" | "info" | "success";
  onClick: Function;
  index: number;
};

const ToastAlert = ({text, severity, onClick, index}: Props) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('removeToast', { detail: { index } }));
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      sx={{
        display: "inline-block",
        minWidth: "200px",
        margin: '5px',
        overflow: "hidden",
        borderRadius: "5px"
      }}
    >
      <Alert 
        severity={severity}
        variant="filled"
        onClose={() => onClick()}
      >
        {text}
      </Alert>
    </Box>
  );
}

export default ToastAlert;
