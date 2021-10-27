import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
// import { useStp } from "../../context/StpContext";
import { useMoralis } from "react-moralis";

export const PropertiesDisplay = () => {
  //   const { contract } = useStp();

  const { Moralis, isWeb3Enabled } = useMoralis();

  //   const [numOfProperties, setNumOfProperties] = useState(0);

  const [propertyNfts, setPropertyNfts] = useState<Array<any>>([]);

  useEffect(() => {
    const getNumOfProperties = async () => {
      //   const result = contract ? await contract.methods.getNumberOfProperties().call() : 0;
      //   setNumOfProperties(result);

      const options = {
        chain: "kovan" as const,
        token_address: "0xD0614cdbcE996a235eA9846B83310EBF3c900915",
      };
      // @ts-ignore - Type in react-moralis seems incorrect here?
      const nfts = await Moralis.Web3API.token.getAllTokenIds(options);
      setPropertyNfts(nfts.result || []);
    };
    isWeb3Enabled && getNumOfProperties();
  }, [isWeb3Enabled]);

  return <Box>{propertyNfts.length}</Box>;
};
