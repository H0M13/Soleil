import React, { createContext, useContext, useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import contractJson from "./soleilContract.json";
import { AbiItem } from "web3-utils";
import { Contract } from "web3-eth-contract";

interface SoleilContextValue {
  contract?: Contract;
}

const SoleilContext = createContext<SoleilContextValue | undefined>(undefined);

interface SoleilProviderProps {
  children: React.ReactNode;
}

const SoleilProvider = ({ children }: SoleilProviderProps) => {
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
    <SoleilContext.Provider
      value={{
        contract,
      }}
    >
      {children}
    </SoleilContext.Provider>
  );
};

const useSoleil = () => {
  const context = useContext(SoleilContext);
  if (context === undefined) {
    throw new Error("useSoleil must be used within a SoleilProvider");
  }
  return context;
};

export { SoleilProvider, useSoleil };
