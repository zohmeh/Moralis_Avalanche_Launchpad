import React, { useState, useEffect } from "react";
import { useMoralis } from "react-moralis";
import { Card, Image, Button } from "antd";
import { Moralis } from "moralis";
import { MagePadNFTAddress, MagePadNFTABI, MarketplaceAddress, MarketplaceABI } from "../../helpers/contractABI";
import { getEllipsisTxt, tokenValue } from "../../helpers/formatters";
import moneyFlow from "../../images/moneyFlow.jpg";

Moralis.start({
  serverUrl: process.env.REACT_APP_MORALIS_SERVER_URL,
  appId: process.env.REACT_APP_MORALIS_APPLICATION_ID,
});

function MyOffer({ nft, index }) {
  const { Moralis, user } = useMoralis();
  
  const buyNFT = async () => {
    const options = {
        contractAddress: MarketplaceAddress,
        functionName: "buyNFT",
        abi: MarketplaceABI,
        msgValue: nft.myBid,
        params: {
          tokenId: nft.tokenId,
          magePadNFTAddress: MagePadNFTAddress
        }
      };
      await Moralis.executeFunction(options);

      //store the price in pricehistory
      const storeParams = {
        tokenId: nft.tokenId,
        price: nft.myBid,
        date: Date.now(),
        MagePadNFTAddress: MagePadNFTAddress,
      }
      
      await Moralis.Cloud.run("storePricehistory", storeParams);

      //clear database after buy event
      const params = {
        tokenId: nft.tokenId,
        MagePadNFTAddress: MagePadNFTAddress,
        }
        await Moralis.Cloud.run("clearAfterBuy", params);
  }

  return (
    <Card
      hoverable
      bordered={false}
      style={{
        //width: 380,
        height: 250,
        backgroundColor: "rgba(50,50,50,0.6)",
        padding: "10px",
        boxshadow: "20px 20px",
        borderRadius: "30px",
        color: "white",
      }}
    >
      <h3 style={{ color: "orange" }}>{"Hourglass NFT " + " " + nft.tokenId} </h3>
      <p>MyBid: {tokenValue(nft.myBid, 18) + " AVAX"} </p>
      <p>Accepted by seller: {nft.isAccepted.toString()}</p>
      {nft.isAccepted && <div style={{display: "flex", justifyContent: "center"}}>
        < Button onClick={buyNFT} style={{color: "orange", backgroundColor: "blue", borderRadius: "15px", border: "0px"}}>Buy NFT</Button>
      </div>}
    </Card>
  )  
}

export default MyOffer;