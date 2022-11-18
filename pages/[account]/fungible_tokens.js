import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import useSWR from "swr"
import TokenList from "../../components/TokenList"
import Layout from "../../components/common/Layout"
import { getFTBalances, getItems } from "../../flow/scripts"
import { isValidFlowAddress, getResourceType } from "../../lib/utils"
import { TokenListProvider, ENV, Strategy } from 'flow-native-token-registry'
import Custom404 from "./404"
import publicConfig from "../../publicConfig"
import Spinner from "../../components/common/Spinner"

const tokenBalancesFetcher = async (funcName, address) => {
  return await getFTBalances(address)
}

const formatBalancesData = (balances) => {
  return balances.map((data) => {
    const resource = getResourceType(data.type)
    const contract = resource.replace(".Vault", "")
    return {
      balance: data.balance,
      contract: contract
    }
  })
}

export default function FungibleTokens(props) {
  const router = useRouter()
  const { account } = router.query

  const [tokens, setTokens] = useState([])
  const [registryTokenList, setRegistryTokenList] = useState(null)

  const { data: balancesData, error: balancesError } = useSWR(
    account && isValidFlowAddress(account) ? ["tokenBalancesFetcher", account] : null, tokenBalancesFetcher
  )

  useEffect(() => {
    let env = ENV.Mainnet
    if (publicConfig.chainEnv == 'testnet') {
      env = ENV.Testnet
    }

    new TokenListProvider().resolve(Strategy.GitHub, env).then(tokens => {
      const tokenList = tokens.getList().map((token) => {
        token.id = `${token.address.replace("0x", "A.")}.${token.contractName}`
        return token
      })
      setRegistryTokenList(tokenList)
    })
  }, [setRegistryTokenList])

  useEffect(() => {
    if (balancesData && registryTokenList) {
      const tokensInfo = formatBalancesData(balancesData)
      for (let i = 0; i < tokensInfo.length; i++) {
        const token = tokensInfo[i]
        const registryInfo = registryTokenList.find((t) => t.id == token.contract)
        if (registryInfo) {
          token.symbol = registryInfo.symbol
          token.logoURL = registryInfo.logoURI
        }
      }

      const info = tokensInfo.map((t) => {
        let order = t.symbol
        // Make sure FLOW is the first one
        if (t.symbol == "FLOW") order = ""
        return {...t, order: order }
      }).sort((a, b) => a.order.localeCompare(b.order))
      setTokens(info)
    }
  }, [balancesData, registryTokenList])

  if (!account) {
    return <></>
  }

  if (!isValidFlowAddress(account)) {
    return <Custom404 title={"Account may not exist"} />
  }

  const showTokens = () => {
    if (!balancesData || !registryTokenList) {
      return (
        <div className="flex mt-10 h-[200px] justify-center">
          <Spinner />
        </div>
      )
    } else {
      return (
        <TokenList tokens={tokens} />
      )
    }
  }

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <Layout>
        {showTokens()}
      </Layout>
    </div>
  )
}