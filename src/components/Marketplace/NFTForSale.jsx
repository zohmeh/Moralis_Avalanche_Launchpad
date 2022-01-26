import React, { useState, useEffect } from "react";
import { useMoralis, useMoralisCloudFunction } from "react-moralis";
import { Card, Button, InputNumber, Spin } from "antd";
import { Moralis } from "moralis";
import { MagePadNFTAddress, MagePadNFTABI, MarketplaceAddress, MagePadAddress, MagePadABI, MarketplaceABI} from "../../helpers/contractABI";
import { getEllipsisTxt, tokenValue } from "../../helpers/formatters";
import { Line } from "@ant-design/charts";
var QRCode = require('qrcode.react');

Moralis.start({
  serverUrl: process.env.REACT_APP_MORALIS_SERVER_URL,
  appId: process.env.REACT_APP_MORALIS_APPLICATION_ID,
});

function NFTForSale({ nft, index }) {
  const tokenId = nft.attributes.tokenId;
  const { Moralis, user } = useMoralis();
  const [stakingReward, setStakingReward] = useState();
  const [amount, setAmount] = useState(0);
  const [showDiagramm, setShowDiagramm] = useState(false);
  const [isStateLoading, setIsStateLoading] = useState(false);
  const [nftInfo, setNFTInfo] = useState();
  const _walletAddress = user ? user.attributes.ethAddress : null;
  const { data, error, isLoading } = useMoralisCloudFunction(
    "getPricehistory",
    { MagePadNFTAddress, tokenId },
    [],
    { live: true }
  );

  async function fetchingNFTData() {
    const params =  { 
      tokenId: tokenId,
      MagePadNFTAddress: MagePadNFTAddress,
      MarketplaceAddress: MarketplaceAddress,
      MagePadAddress: MagePadAddress,
      MagePadNFTABI: MagePadNFTABI,
      MarketplaceABI: MarketplaceABI,
      MagePadABI: MagePadABI, 
    };
    const info = await Moralis.Cloud.run("getMageNFTInfo", params);
    setNFTInfo(info);
    parseInt(info.lockedAmount) > 0 ? setStakingReward(((Date.now() / 1000) - parseInt(info.mintingTime)) * parseInt(info.interest)) : setStakingReward(0);
  }

  let config;
  if(data) {
    config = {
      data: data,
      padding: 'auto',
      xField: 'date',
      yField: 'price',
      color: "orange",
    };  
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
        nftInfo != undefined && parseInt(nftInfo.lockedAmount) > 0 && setStakingReward(stakingReward => stakingReward + parseInt(nftInfo.interest) / 10);
    }, 100);
        return () => clearInterval(interval);
  }, [isStateLoading, nftInfo]);

  useEffect(() => {
    fetchingNFTData();
  }, [isStateLoading]);
 
  async function makeOffer() {
    setIsStateLoading(true);
    const web3 = await Moralis.enableWeb3();
    const params = {
          tokenId: tokenId,
          price: web3.utils.toWei(amount.toString(), "ether").toString(),
          walletAddress: _walletAddress,
          MagePadNFTAddress: MagePadNFTAddress,
          MarketplaceAddress: MarketplaceAddress,
      }
      await Moralis.Cloud.run("placeOffer", params);
      
      const NewOffer = Moralis.Object.extend("NewOffer");
      const newOffer = new NewOffer();

      newOffer.set("tokenId", tokenId);
      newOffer.set("magePadNFTAddress", MagePadNFTAddress);
      newOffer.set("highestBidder", _walletAddress);
      newOffer.set("highestBid", web3.utils.toWei(amount.toString(), "ether").toString());

      await newOffer.save();
      setIsStateLoading(false);
  }

  if(nftInfo) {
    return (
    <Card
      hoverable
      bordered={false}
      style={{
        //width: 380,
        backgroundColor: "rgba(50,50,50,0.6)",
        padding: "10px",
        boxshadow: "20px 20px",
        borderRadius: "30px",
        color: "white",
      }}
      cover={
        <div style={{display: "flex", flexDirection:"column"}}>
          <Button onClick={() => setShowDiagramm(!showDiagramm)} style={{color: "orange", backgroundColor: "blue", borderRadius: "15px", border: "0px"}}>{showDiagramm ? "Show QR Code" : "Show Pricehistory"}</Button>
          {showDiagramm === false ?
          <div style={{display: "flex", flexDirection:"column", alignItems: "center", justifyContent: "center", height: "300px"}}>
          {nftInfo.projectImage && <QRCode value={nftInfo.projectImage._url} size={250}/>}
        </div>
          :
        <div style={{ height: "300px", borderRadius: "150px" }}>
        {data === null ? <Spin /> : <Line {...config} />}
        </div>
        }
        </div>
      }
      //key={nft.id}
    >
      <h3 style={{ color: "orange" }}>{"Hourglass NFT "+ " " + nftInfo.tokenId} </h3>
      <p>{"Locked Token: " + nftInfo.tokenName}</p>
      <p>{"Locked Amount: " + tokenValue(nftInfo.lockedAmount, nftInfo.tokenDecimals).toFixed(6)}</p>
      <p>{"Earned staking reward: " + tokenValue(stakingReward, nftInfo.tokenDecimals).toFixed(6)}</p>
      <p>Actual highest bidder: {getEllipsisTxt(nftInfo.marketInfo.bidder)} </p>
      <p>Actual highest bid: {tokenValue(nftInfo.marketInfo.price, 18).toFixed(6) + " AVAX"} </p>
      {isStateLoading ? <div style={{display: "flex", justifyContent: "center"}}><Spin/></div> :
      <div style={{display: "flex", justifyContent: "center"}}>
      <InputNumber style={{width: "180px"}} min="0" step="0.000000000000000001"onChange={(event) => setAmount(event)}/>    
      < Button onClick={makeOffer} style={{color: "orange", backgroundColor: "blue", borderRadius: "15px", border: "0px"}}>Make Offer</Button>
    </div>
    }     
    </Card>
  );}
  else {
    return <div></div>
  }
}

export default NFTForSale;
