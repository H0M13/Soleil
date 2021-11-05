import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useMoralis } from "react-moralis";

export const PropertiesDisplay = () => {
  const { Moralis, isWeb3Enabled } = useMoralis();

  useEffect(() => {
    const getRegisteredSites = async () => {
      // TODO - get sites from Moralis DB
    };
    getRegisteredSites();
  }, []);

  return <></>;
};
