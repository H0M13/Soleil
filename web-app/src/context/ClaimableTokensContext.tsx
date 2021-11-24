import React, { createContext, useContext, useEffect, useState } from "react";
import { useSoleil } from "./SoleilContext";
import { useMoralis } from "react-moralis";
import { useCeramic } from "./CeramicContext";
import { toChecksumAddress } from "web3-utils";

interface ClaimableTokensContextValue {
  claimableDai: string;
  claimableSll: string;
  getUsersProofForDaiEarnings: () => Promise<string>;
  getUsersProofForSllEarnings: () => Promise<string>;
}

const ClaimableTokensContext = createContext<
  ClaimableTokensContextValue | undefined
>(undefined);

interface ClaimableTokensProviderProps {
  children: React.ReactNode;
}

const ClaimableTokensProvider = ({
  children,
}: ClaimableTokensProviderProps) => {
  const { contract } = useSoleil();
  const { user } = useMoralis();
  const {
    daiEarningsData,
    sllEarningsData,
    getProofForDaiEarnings,
    getProofForSllEarnings,
  } = useCeramic();

  const getUsersProofForDaiEarnings = async () => {
    const daiPaymentCycleNumber = contract
      ? await contract?.numDaiPaymentCycles()
      : null;

    const userAddress = user
      ? toChecksumAddress(user?.attributes.ethAddress)
      : "";

    let proof = "";
    // @ts-ignore
    if (
      userAddress &&
      daiPaymentCycleNumber &&
      daiEarningsData &&
      daiEarningsData.content.recipients.length > 0
    ) {
      // TODO: I think having to -1 here is a bug
      proof = getProofForDaiEarnings(
        userAddress,
        daiPaymentCycleNumber.toNumber() - 1
      );
    }
    return proof;
  };

  const getUsersProofForSllEarnings = async () => {
    const sllPaymentCycleNumber = contract
      ? await contract?.numSllPaymentCycles()
      : null;

    const userAddress = user ? user?.attributes.ethAddress : "";

    let proof = "";
    // @ts-ignore
    if (
      userAddress &&
      sllPaymentCycleNumber &&
      sllEarningsData &&
      sllEarningsData.content.recipients.length > 0
    ) {
      // TODO: I think having to -1 here is a bug
      proof = getProofForSllEarnings(
        userAddress,
        sllPaymentCycleNumber.toNumber() - 1
      );
    }
    return proof;
  };

  const [claimableDai, setClaimableDai] = useState("");

  useEffect(() => {
    const getClaimableAmount = async () => {
      const userAddress = toChecksumAddress(user?.attributes.ethAddress);
      const proof = await getUsersProofForDaiEarnings();

      const daiBalance =
        proof && userAddress
          ? await contract?.daiBalanceForProofWithAddress(userAddress, proof)
          : "";

      setClaimableDai(daiBalance ? daiBalance.toString() : "");
    };

    if (
      user &&
      contract &&
      daiEarningsData &&
      daiEarningsData.content.recipients.length > 0
    ) {
      getClaimableAmount();
    }
  }, [daiEarningsData, contract, user]);

  const [claimableSll, setClaimableSll] = useState("");

  useEffect(() => {
    const getClaimableAmount = async () => {
      const userAddress = user?.attributes.ethAddress;
      const proof = await getUsersProofForSllEarnings();

      const sllBalance =
        proof && userAddress
          ? await contract?.sllBalanceForProofWithAddress(userAddress, proof)
          : "";

      setClaimableSll(sllBalance ? sllBalance.toString() : "");
    };

    if (
      user &&
      contract &&
      sllEarningsData &&
      sllEarningsData.content.recipients.length > 0
    ) {
      getClaimableAmount();
    }
  }, [sllEarningsData, contract, user]);

  return (
    <ClaimableTokensContext.Provider
      value={{
        claimableDai,
        claimableSll,
        getUsersProofForDaiEarnings,
        getUsersProofForSllEarnings,
      }}
    >
      {children}
    </ClaimableTokensContext.Provider>
  );
};

const useClaimableTokens = () => {
  const context = useContext(ClaimableTokensContext);
  if (context === undefined) {
    throw new Error(
      "useClaimableTokens must be used within a ClaimableTokensProvider"
    );
  }
  return context;
};

export { ClaimableTokensProvider, useClaimableTokens };
