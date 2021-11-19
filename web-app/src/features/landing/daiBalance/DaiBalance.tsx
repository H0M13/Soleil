import { useMoralis } from "react-moralis"
import { useSoleil } from "../../../context/SoleilContext"
import { useState, useEffect } from "react"

export const DaiBalance = () => {

    const { Moralis, web3 } = useMoralis()
    const { poolManagerContractAddress, daiContractAddress } = useSoleil()

    const [daiBalance, setDaiBalance] = useState<string>("")

    useEffect(() => {
        const getBalance = async () => {
            const options = { chain: 'rinkeby' as const, address: poolManagerContractAddress }
            const balances = await Moralis.Web3API.account.getTokenBalances(options);
            const daiBalance = balances.find(balance => balance.token_address.toLowerCase() === daiContractAddress.toLowerCase())
            daiBalance && setDaiBalance(daiBalance.balance);
        }
        getBalance()
    }, [])

    return <span>Contract DAI balance: {web3?.utils.fromWei(daiBalance)}</span>
}