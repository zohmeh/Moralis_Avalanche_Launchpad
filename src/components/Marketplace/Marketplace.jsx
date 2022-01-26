import React from "react";
import { useMoralisCloudFunction } from "react-moralis";
import NFTForSale from "./NFTForSale";
import { MagePadNFTAddress, MarketplaceAddress } from "../../helpers/contractABI";
import { Skeleton } from "antd";


const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "flex-start",
    margin: "0 auto",
    maxWidth: "1000px",
    width: "100%",
    gap: "10px",
  },
};

function Marketplace() {
  const { data, error, isLoading } = useMoralisCloudFunction(
    "getNFTForSale",
    { MagePadNFTAddress, MarketplaceAddress },
    [],
    { live: true }
  );

  return (
      <div style={styles.NFTs}>
        <Skeleton loading={!data}>
          {data &&
            data.map((nft, index) => {
                return (
                  <NFTForSale nft={nft} index={index} key={nft.id} />
                );
              }
            )}
        </Skeleton>
      </div>
  );
}

export default Marketplace;
