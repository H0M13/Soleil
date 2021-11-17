import React, { createContext, useContext, useEffect, useState } from "react";
import config from "../config.json";
const { CeramicClient } = require("@ceramicnetwork/http-client");

interface CeramicContextValue {
  daiEarningsData?: any;
  sllEarningsData?: any;
}

const CeramicContext = createContext<CeramicContextValue | undefined>(
  undefined
);

interface CeramicProviderProps {
  children: React.ReactNode;
}

const CeramicProvider = ({ children }: CeramicProviderProps) => {
  // Read Ceramic Network earnings streams details from config.json
  const cumulativeDaiEarningsStreamId = config.streams.CumulativeDaiEarnings.id;
  const cumulativeSllEarningsStreamId = config.streams.CumulativeSllEarnings.id;

  const [daiEarningsData, setDaiEarningsData] = useState();
  const [sllEarningsData, setSllEarningsData] = useState();

  useEffect(() => {
    const ceramic = new CeramicClient(process.env.REACT_APP_CERAMIC_API_URL);

    const loadDaiEarningsData = async () => {
      const daiEarningsDoc = await ceramic.loadStream(
        cumulativeDaiEarningsStreamId
      );
      console.log("DAI earnings:");
      console.log(daiEarningsDoc.content);
      setDaiEarningsData(daiEarningsDoc);
    };

    const loadSllEarningsData = async () => {
      const sllEarningsDoc = await ceramic.loadStream(
        cumulativeSllEarningsStreamId
      );
      console.log("SLL earnings:");
      console.log(sllEarningsDoc.content);
      setSllEarningsData(sllEarningsDoc);
    };

    loadDaiEarningsData();
    loadSllEarningsData();
  }, []);

  return (
    <CeramicContext.Provider
      value={{
        daiEarningsData,
        sllEarningsData,
      }}
    >
      {children}
    </CeramicContext.Provider>
  );
};

const useCeramic = () => {
  const context = useContext(CeramicContext);
  if (context === undefined) {
    throw new Error("useCeramic must be used within a CeramicProvider");
  }
  return context;
};

export { CeramicProvider, useCeramic };
