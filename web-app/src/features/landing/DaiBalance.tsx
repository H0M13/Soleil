import { useSoleil } from "../../context/SoleilContext";
import { useTokenBalance } from "@usedapp/core";
import { formatUnits } from "@ethersproject/units";

export const DaiBalance = () => {
  const { poolManagerContractAddress, daiContractAddress } = useSoleil();

  const tokenBalance = useTokenBalance(daiContractAddress, poolManagerContractAddress);

  return (
    <div>{tokenBalance && <p>Contract DAI balance: {formatUnits(tokenBalance, 18)}</p>}</div>
  );
};
