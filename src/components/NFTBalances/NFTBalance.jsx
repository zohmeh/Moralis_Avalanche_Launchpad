import React, { useState, useEffect } from "react";
import { useMoralis, useMoralisCloudFunction } from "react-moralis";
import { Card, Image, Button, Spin } from "antd";
import { Moralis } from "moralis";
import { MagePadNFTAddress, MagePadNFTABI, MarketplaceAddress, MagePadAddress, MagePadABI, MarketplaceABI} from "../../helpers/contractABI";
import { getEllipsisTxt, tokenValue } from "../../helpers/formatters";
import "./nftbalance_styling.css";
import { Line } from "@ant-design/charts";
var QRCode = require('qrcode.react');


Moralis.start({
  serverUrl: process.env.REACT_APP_MORALIS_SERVER_URL,
  appId: process.env.REACT_APP_MORALIS_APPLICATION_ID,
});

function NFTBalance({ nft, index }) {
  const tokenId = nft.token_id;
  let config;
  const { Moralis, account } = useMoralis();
  const [stakingReward, setStakingReward] = useState();
  const [showDiagramm, setShowDiagramm] = useState(false);
  const [isStateLoading, setIsStateLoading] = useState(false);
  const [nftInfo, setNFTInfo] = useState();
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
 
  useEffect(() => {
    const interval = setInterval(() => {
        nftInfo != undefined && parseInt(nftInfo.lockedAmount) > 0 && setStakingReward(stakingReward => stakingReward + parseInt(nftInfo.interest) / 10);
    }, 100);
        return () => clearInterval(interval);
  }, [isStateLoading, nftInfo]);

  useEffect(() => {
    fetchingNFTData();
  }, [isStateLoading]);

  if(data) {
    config = {
      data: data,
      padding: 'auto',
      xField: 'date',
      yField: 'price',
      color: "orange",
      xAxis: { title: {text: "Date", style:{fill: "orange"}}, label: {style:{fill: "orange"}}},
      yAxis: { title: {text: "Price", style:{fill: "orange"}}, label: {style:{fill: "orange"}}}
    };  
  };

  async function putOnSale() {
    setIsStateLoading(true);
    const options = {
      contractAddress: MagePadNFTAddress,
      functionName: "putForSale",
      abi: MagePadNFTABI,
      params: {
        _tokenId: tokenId,
        _magePadNFTAddress: MagePadNFTAddress
      }
    };
    await Moralis.executeFunction(options);
    const NewSale = Moralis.Object.extend("NewSale");
    const newSale = new NewSale();

    newSale.set("tokenId", tokenId);
    newSale.set("magePadNFTAddress", MagePadNFTAddress);

    await newSale.save();
    setIsStateLoading(false);
  }

  async function withdraw() {
    setIsStateLoading(true);
    const optionsWithdraw = {
      contractAddress: MagePadNFTAddress,
      functionName: "withdrawStakedAmount",
      abi: MagePadNFTABI,
      params: {
        _tokenId: tokenId,
        _magePadAddress: MagePadAddress
      }
    };
    await Moralis.executeFunction(optionsWithdraw);
    setIsStateLoading(false);
  }

  async function removeOffer() {
    setIsStateLoading(true);
    const options = {
      contractAddress: MagePadNFTAddress,
      functionName: "removeFromSale",
      abi: MagePadNFTABI,
      params: {
        _tokenId: tokenId,
        _magePadNFTAddress: MagePadNFTAddress
      }
    };
    await Moralis.executeFunction(options);

    const params = {
      tokenId: tokenId,
      MagePadNFTAddress: MagePadNFTAddress,
    };

    await Moralis.Cloud.run("deleteOfferFromSale", params);
    setIsStateLoading(false);
  }

  async function acceptOffer() {
    setIsStateLoading(true);
    const params = {
      tokenId: tokenId,
      walletAddress: account,
      MagePadNFTAddress: MagePadNFTAddress,
      MarketplaceAddress: MarketplaceAddress,
  }
  await Moralis.Cloud.run("acceptFinalOffer", params);
  setIsStateLoading(false);
  }

  if(nftInfo) {
    
  return (
      <Card
      hoverable
      bordered={false}
      style={{
        width: 280,
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
      <h3 style={{ color: "orange" }}>{nft.name + " " + tokenId} </h3>
      <p>{"Locked Token: " + nftInfo.tokenName}</p>
      <p>{"Locked Amount: " + tokenValue(nftInfo.lockedAmount, nftInfo.tokenDecimals).toFixed(6)}</p>
      <p>{"Earned staking reward: " + tokenValue(stakingReward, nftInfo.tokenDecimals).toFixed(6)}</p>
      <p>Is for sale on the market: {nftInfo.marketInfo.isActive.toString()}</p>
      {nftInfo.marketInfo.isActive === true && <p>Actual highest bidder: {getEllipsisTxt(nftInfo.marketInfo.bidder)} </p>}
      {nftInfo.marketInfo.isActive === true && <p>Actual highest bid: {tokenValue(nftInfo.marketInfo.price, 18).toFixed(6) + " AVAX"} </p>}
      {nftInfo.marketInfo.isActive === true && <p>Offer accepted: {nftInfo.marketInfo.offerAccepted.toString()} </p>}
      {isStateLoading ? <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}><Spin /></div> :
      (nftInfo.marketInfo.isActive === false ?
        <div style={{display: "flex", justifyContent: "center", flexDirection: "column", gap: "10px"}}>
          < Button onClick={putOnSale} style={{color: "orange", backgroundColor: "blue", borderRadius: "15px", border: "0px"}}>Put on Sale</Button>
          < Button onClick={withdraw} style={{color: "orange", backgroundColor: "blue", borderRadius: "15px", border: "0px"}}>Withdraw tokens inside NFT</Button>
        </div>
         :
         nftInfo.marketInfo.isActive === true && !nftInfo.marketInfo.offerAccepted ?  
        <div style={{display: "flex", justifyContent: "space-around"}}>
          < Button onClick={removeOffer} style={{color: "orange", backgroundColor: "blue", borderRadius: "15px", border: "0px"}}>Remove Offer</Button>
          < Button onClick={acceptOffer} style={{color: "orange", backgroundColor: "blue", borderRadius: "15px", border: "0px"}}>Accept Offer</Button>
        </div> 
          :
          <div style={{display: "flex", justifyContent: "center"}}>
          < Button onClick={removeOffer} style={{color: "orange", backgroundColor: "blue", borderRadius: "15px", border: "0px"}}>Remove Offer</Button>
          </div>
      )
      }
      
      
      
    </Card>
  );
    }
    else {
      return (
      <div> </div>)
    }

}

export default NFTBalance;