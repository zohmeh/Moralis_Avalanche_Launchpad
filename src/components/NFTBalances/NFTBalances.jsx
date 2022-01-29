import React, { useEffect, useState } from "react";
import { useMoralis, useMoralisQuery } from "react-moralis";
import { Skeleton } from "antd";
import { Moralis } from "moralis";
import { MagePadNFTAddress, MarketplaceAddress, MagePadABI, MagePadAddress } from "../../helpers/contractABI";
import NFTBalance from "./NFTBalance";
import MyOffers from "./MyOffers";

Moralis.start({
  serverUrl: process.env.REACT_APP_MORALIS_SERVER_URL,
  appId: process.env.REACT_APP_MORALIS_APPLICATION_ID,
});

const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "flex-start",
    //margin: "0 auto",
    width: "65vw",
    //width: "100%",
    gap: "10px",
    //backgroundColor: "red"
  },
};

function NFTBalances() {
  const { account } = useMoralis();
  const [dataNFT, setDataNFT] = useState();
  const [dataOffer, setDataOffer] = useState();
  const { data } = useMoralisQuery(
    "NewSale",
    query => query.descending("objetcId"),
    [],
    { live: true }
  );

  async function fetchData () {
    const params =  { 
      account: account,
      MagePadNFTAddress: MagePadNFTAddress,
    };
    const nftData = await Moralis.Cloud.run("getMyMageNFTs", params);
    setDataNFT(nftData);
  
    const paramsOffer =  { 
      account: account,
      MagePadNFTAddress: MagePadNFTAddress,
      MarketplaceAddress: MarketplaceAddress,
    };
    const offerData = await Moralis.Cloud.run("getMyOffers", paramsOffer);
    setDataOffer(offerData);
  }

  useEffect(() => {
    account && fetchData();
  }, [account, data])

  if(dataOffer && dataNFT) {
    return (
      <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "space-between", width: "100%"}}>
        <div style={styles.NFTs}>
          <Skeleton loading={!dataNFT}>
            {dataNFT &&
              dataNFT.result.map((nft, index) => {
                  return (
                    <NFTBalance nft={nft} index={index} key={nft.token_id} />
                  );
                }
              )}
          </Skeleton>
        </div>
        <MyOffers offers={dataOffer}/>
      </div>
    );
  } else {
    return (<div></div>)
  }


  
}

export default NFTBalances;
