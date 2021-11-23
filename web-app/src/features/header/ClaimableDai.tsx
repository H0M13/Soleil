import { useClaimableTokens } from "../../context/ClaimableTokensContext"
import { utils, BigNumber } from "ethers"

export const ClaimableDai = () => {
    const { claimableDai } = useClaimableTokens()

    return <span>User has {claimableDai ? utils.formatEther(BigNumber.from(claimableDai)) : 0} claimable DAI</span>;
}