import React, { createContext, useContext, useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import contractJson from "./stpContract.json";
import { AbiItem } from "web3-utils";
import { Contract } from "web3-eth-contract";

interface StpContextValue {
  contract?: Contract;
}

const StpContext = createContext<StpContextValue | undefined>(undefined);

interface StpProviderProps {
  children: React.ReactNode;
}

const StpProvider = ({ children }: StpProviderProps) => {
  const { web3, isWeb3Enabled, web3EnableError, enableWeb3, user, Moralis } =
    useMoralis();

  const [contract, setContract] = useState<Contract | undefined>(undefined);

  useEffect(() => {
    if (isWeb3Enabled) {
      console.log("Web3 is enabled");
    } else {
      console.log("Enabling web3");
      enableWeb3();
    }
  }, [isWeb3Enabled, enableWeb3]);

  useEffect(() => {
    const connectToContract = async () => {
      if (web3) {
        const contract = new web3.eth.Contract(
          contractJson.abi as AbiItem[],
          contractJson.address
        );
        setContract(contract);
      }
    };

    if (web3 && isWeb3Enabled) {
      connectToContract();
    }
  }, [web3, isWeb3Enabled]);

  return (
    <StpContext.Provider
      value={{
        contract,
      }}
    >
      {children}
    </StpContext.Provider>
  );
};

const useStp = () => {
  const context = useContext(StpContext);
  if (context === undefined) {
    throw new Error("useStp must be used within a StpProvider");
  }
  return context;
};

export { StpProvider, useStp };
