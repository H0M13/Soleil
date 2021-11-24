import { ethers, BigNumber } from "ethers";
import React, { createContext, useContext, useEffect, useState } from "react";
import config from "../config.json";
import CumulativePaymentTree from "../utils/cumulativePaymentTree";
import { hexToNumberString } from "web3-utils";
const { CeramicClient } = require("@ceramicnetwork/http-client");
interface CeramicContextValue {
  daiEarningsData?: any;
  sllEarningsData?: any;
  getProofForDaiEarnings: (address: string, paymentCycleNumber: number) => string;
  getProofForSllEarnings: (address: string, paymentCycleNumber: number) => string;
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

  const [daiEarningsData, setDaiEarningsData] = useState(undefined);
  const [sllEarningsData, setSllEarningsData] = useState(undefined);

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

  const getProofForDaiEarnings = (address: string, paymentCycleNumber: number) => {
    let proof = "";
    // @ts-ignore
    if (address && paymentCycleNumber && daiEarningsData && daiEarningsData.content.recipients.length > 0) {
      // @ts-ignore
      const paymentsData = daiEarningsData.content.recipients;
      const daiPaymentTree = new CumulativePaymentTree(paymentsData);

      proof = daiPaymentTree.hexProofForPayee(
        address,
        +paymentCycleNumber
      );
    }
    return proof;
  };

  const getProofForSllEarnings = (address: string, paymentCycleNumber: number) => {
    let proof = "";
    // @ts-ignore
    if (address && paymentCycleNumber && sllEarningsData && sllEarningsData.content.recipients.length > 0) {
      // @ts-ignore
      const paymentsData = sllEarningsData.content.recipients;
      const sllPaymentTree = new CumulativePaymentTree(paymentsData);

      proof = sllPaymentTree.hexProofForPayee(
        address,
        +paymentCycleNumber
      );
    }
    return proof;
  };

  return (
    <CeramicContext.Provider
      value={{
        daiEarningsData,
        sllEarningsData,
        getProofForDaiEarnings,
        getProofForSllEarnings
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
