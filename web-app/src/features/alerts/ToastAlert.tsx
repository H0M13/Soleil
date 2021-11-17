import { Box, Alert } from "@mui/material";

interface Props {
  text: string;
  severity: "error" | "warning" | "info" | "success";
};

const ToastAlert = ({text, severity}: Props) => {
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
        onClose={() => {}}
      >
        {text}
      </Alert>
    </Box>
  );
}

export default ToastAlert;
