import React, { createContext, useContext, useEffect, useState } from "react";
import { useSoleil } from "./SoleilContext";
import { useMoralis } from "react-moralis";
import { useCeramic } from "./CeramicContext";
import { toChecksumAddress } from "web3-utils";

interface ClaimableTokensContextValue {
  claimableDai: string;
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
  const { daiEarningsData, getProofForDaiEarnings } = useCeramic();

  const [claimableDai, setClaimableDai] = useState("");

  useEffect(() => {
    const getClaimableAmount = async () => {
      const daiPaymentCycleNumber = await contract?.numDaiPaymentCycles();

      const userAddress = toChecksumAddress(user?.attributes.ethAddress);

      // TODO: I think having to -1 here is a bug
      const proof = getProofForDaiEarnings(
        userAddress,
        daiPaymentCycleNumber.toNumber() - 1
      );

      const daiBalance = await contract?.daiBalanceForProofWithAddress(
        userAddress,
        proof
      );

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

  return (
    <ClaimableTokensContext.Provider
      value={{
        claimableDai,
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
