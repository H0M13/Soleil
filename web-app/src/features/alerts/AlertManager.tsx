import { Box } from "@mui/material";
import { useEffect, useState, useRef } from "react";
import ToastAlert from "./ToastAlert";

const AlertManager = () => {
  const [alerts, setAlerts]: [
    { 
      text: string,
      severity: "error" | "warning" | "info" | "success",
    }[],
    Function
  ] = useState([]);
  const alertsRef = useRef(alerts);
  
  useEffect(() => {
    window.addEventListener('addToast', addToast);
    window.addEventListener('removeToast', removeToast);
    return () => { 
      window.removeEventListener('addToast', addToast);
      window.removeEventListener('removeToast', removeToast);
    };
  }, []);

  const updateAlerts = (data: { 
    text: string,
    severity: "error" | "warning" | "info" | "success",
  }[]) => {
    alertsRef.current = data;
    setAlerts(data);
  };

  const addToast = (event: any) => {
    const newAlerts = [...alertsRef.current];
    newAlerts.push(event.detail);
    updateAlerts(newAlerts);
  };

  const removeToast = (event: any) => {
    const index = event.detail.index
    if (index > -1 && alertsRef.current.length > 0) {
      const newAlerts = [...alertsRef.current];
      newAlerts.splice(index, 1);
      updateAlerts(newAlerts);
    }
  };

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
      {
        alerts.map((data, index) => (
          <ToastAlert 
            text={data.text}
            severity={data.severity}
            index={index}
            onClick={() => {
              removeToast({detail: { index }})
            }}
          />
        ))
      }
    </Box>
  );
}

export default AlertManager;

