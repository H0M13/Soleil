import { Box } from "@mui/material";
import { useEffect, useState, useRef } from "react";
import ToastAlert from "./ToastAlert";

const AlertManager = () => {
  const [alerts, setAlerts]: [
    {
      content: React.ReactNode;
      severity: "error" | "warning" | "info" | "success";
      requiresManualDismiss?: boolean;
    }[],
    Function
  ] = useState([]);
  const alertsRef = useRef(alerts);

  useEffect(() => {
    window.addEventListener("addToast", addToast);
    window.addEventListener("removeToast", removeToast);
    window.addEventListener("removeAllToasts", removeAllToasts);
    return () => {
      window.removeEventListener("addToast", addToast);
      window.removeEventListener("removeToast", removeToast);
      window.removeEventListener("removeAllToasts", removeAllToasts);
    };
  }, []);

  const updateAlerts = (
    data: {
      content: React.ReactNode;
      severity: "error" | "warning" | "info" | "success";
      requiresManualDismiss?: boolean;
    }[]
  ) => {
    alertsRef.current = data;
    setAlerts(data);
  };

  const addToast = (event: any) => {
    const newAlerts = [...alertsRef.current];
    newAlerts.push(event.detail);
    updateAlerts(newAlerts);
  };

  const removeToast = (event: any) => {
    const index = event.detail.index;
    if (index > -1 && alertsRef.current.length > 0) {
      const newAlerts = [...alertsRef.current];
      newAlerts.splice(index, 1);
      updateAlerts(newAlerts);
    }
  };

  const removeAllToasts = (event: any) => {
    updateAlerts([]);
  };

  return (
    <Box
      sx={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        maxWidth: "90%",
        right: 0,
        top: 0,
      }}
    >
      {alerts.map((data, index) => (
        <ToastAlert
          key={index}
          content={data.content}
          severity={data.severity}
          requiresManualDismiss={data.requiresManualDismiss || false}
          index={index}
          onClick={() => {
            removeToast({ detail: { index } });
          }}
        />
      ))}
    </Box>
  );
};

export default AlertManager;
