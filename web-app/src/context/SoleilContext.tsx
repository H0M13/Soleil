import React, { createContext, useContext, useEffect, useState } from "react";
import {
  useMoralis,
  useWeb3ExecuteFunction,
  Web3ExecuteFunctionParameters,
} from "react-moralis";
import poolManagerContractJson from "./soleilContract.json";
import daiContractJson from "./daiContract.json";
import { AbiItem } from "web3-utils";
import { Contract, ethers } from "ethers";

interface SoleilContextValue {
  contract?: Contract;
  poolManagerContractAddress: string;
  daiContractAddress: string;
  useExecuteSoleilFunction: () => {
    fetch: (props: RequiredFetchProps) => Promise<any>;
    isFetching: boolean;
    isLoading: boolean;
    error: Error | null;
    data: unknown;
    setData: import("use-immer").Updater<unknown>;
  };
  useExecuteDaiFunction: () => {
    fetch: (props: RequiredFetchProps) => Promise<any>;
    isFetching: boolean;
    isLoading: boolean;
    error: Error | null;
    data: unknown;
    setData: import("use-immer").Updater<unknown>;
  };
}

const SoleilContext = createContext<SoleilContextValue | undefined>(undefined);

interface SoleilProviderProps {
  children: React.ReactNode;
}

type RequiredFetchProps = {
  functionName: string;
  params: Record<string, unknown>;
};

const useExecuteSoleilFunction = () => {
  const { fetch: rawFetch, ...rest } = useWeb3ExecuteFunction();

  return {
    fetch: ({ functionName, params }: RequiredFetchProps) => {
      const options = {
        contractAddress: poolManagerContractJson.address,
        functionName,
        abi: poolManagerContractJson.abi as AbiItem[],
        params,
      };

      return rawFetch({ params: options });
    },
    ...rest,
  };
};

const useExecuteDaiFunction = () => {
  const { fetch: rawFetch, ...rest } = useWeb3ExecuteFunction();

  return {
    fetch: ({ functionName, params }: RequiredFetchProps) => {
      const options = {
        contractAddress: daiContractJson.address,
        functionName,
        abi: daiContractJson.abi as AbiItem[],
        params,
      };

      return rawFetch({ params: options });
    },
    ...rest,
  };
};

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
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.REACT_APP_RPC_URL
      );
      const contract = new ethers.Contract(
        poolManagerContractJson.address,
        poolManagerContractJson.abi,
        provider
      );
      setContract(contract);
    };

    connectToContract();
  }, [web3, isWeb3Enabled]);

  return (
    <SoleilContext.Provider
      value={{
        contract,
        poolManagerContractAddress: poolManagerContractJson.address,
        daiContractAddress: daiContractJson.address,
        useExecuteSoleilFunction,
        useExecuteDaiFunction,
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
