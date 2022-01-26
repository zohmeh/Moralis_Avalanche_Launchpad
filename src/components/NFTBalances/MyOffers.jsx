import React from "react";
import { useMoralis, useMoralisCloudFunction } from "react-moralis";
import { Skeleton } from "antd";
import { Moralis } from "moralis";
import { MagePadNFTAddress, MarketplaceAddress } from "../../helpers/contractABI";
import MyOffer from "./MyOffer";

Moralis.start({
  serverUrl: process.env.REACT_APP_MORALIS_SERVER_URL,
  appId: process.env.REACT_APP_MORALIS_APPLICATION_ID,
});

function MyOffers() {
  const { account } = useMoralis();
  const { data } = useMoralisCloudFunction(
    "getMyOffers",
    { MagePadNFTAddress, account, MarketplaceAddress },
    [],
    { live: true }
  );

  const styles = {
    NFTs: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      WebkitBoxPack: "start",
      justifyContent: "flex-start",
      margin: "0 auto",
      //maxWidth: "1000px",
      width: "35vw",
      gap: "10px",
      //backgroundColor: "blue"
    },
  };
 
  return (
    <div style={styles.NFTs}>
        <Skeleton loading={!data}>
          {data &&
            data.map((nft, index) => {
                return (
                  <MyOffer nft={nft} index={index} key={index} />
                );
              }
            )}
        </Skeleton>
      </div>
  );
}

export default MyOffers;