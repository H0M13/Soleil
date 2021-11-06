import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useMoralis } from "react-moralis";

export const SitesDisplay = () => {
  const { Moralis, isWeb3Enabled, isInitialized } = useMoralis();

  const [sites, setSites] = useState<Array<any>>([]);

  useEffect(() => {
    const getRegisteredSites = async () => {
      const sitesQuery = new Moralis.Query("Site");
      const results = await sitesQuery.find();
      console.log(results);
      setSites(results);
    };
    isInitialized && getRegisteredSites();
  }, [isInitialized]);

  return (
    <>
      <Typography variant="h4">Registered Sites</Typography>
      {sites.map((site) => (
        <span>{site.attributes.name}</span>
      ))}
    </>
  );
};
