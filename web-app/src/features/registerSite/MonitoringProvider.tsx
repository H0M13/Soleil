import React from "react";
import { Box, Button, Card } from "@mui/material";

export interface MonitoringProviderProps {
  imgSrc: any;
  disabled?: boolean;
  onClick?: Function;
}

export const MonitoringProvider = ({
  imgSrc,
  disabled = false,
  onClick,
}: MonitoringProviderProps) => {
  return (
    <Button
      disableElevation
      disabled={disabled}
      sx={{
        width: "fit-content",
        p: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        border: "1px solid black",
      }}
      onClick={() => {onClick && onClick()}}
    >
      <img src={imgSrc} width="100" />
      {disabled && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "#000",
            opacity: 0.5,
          }}
        />
      )}
    </Button>
  );
};
