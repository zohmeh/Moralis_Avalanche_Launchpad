import { useEffect, useState } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";

export const useERC20Balance = (params) => {
  const { account } = useMoralisWeb3Api();
  const { isInitialized, chainId, walletAddress } = useMoralis();

  console.log(walletAddress);
  const [assets, setAssets] = useState();

  useEffect(() => {
    if (isInitialized) {
      fetchERC20Balance().then((balance) => setAssets(balance));
      console.log(chainId);
      console.log(assets);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, chainId, walletAddress]);

  const fetchERC20Balance = async () => {
    const result = await account.getTokenBalances({ address: walletAddress, chain: chainId });
    console.log(result);
    return result;
  };

  return assets;
};
