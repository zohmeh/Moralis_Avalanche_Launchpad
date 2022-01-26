import { useState, useEffect } from "react";
import { useMoralis } from "react-moralis";
import { Skeleton, Table, Image, Button, Spin } from "antd";
import { tokenValue } from "../../helpers/formatters";
import { MagePadNFTABI, MagePadNFTAddress, MagePadABI, MagePadAddress } from "../../helpers/contractABI";

function LaunchpadBalance() {
  const [transaction, setTransaction] = useState("");
  const [myInvestments, setMyInvestments] = useState([]);
  const [isMinting, setIsMinting] = useState(false);
  const [itemId, setItemId] = useState("");
  const { Moralis, account } = useMoralis();
 
  const fetchMyInvestments = async () => {
    const params = {
       MagePadABI: MagePadABI,
       MagePadAddress: MagePadAddress,
       walletAddress: account,
     }
     const investments = await Moralis.Cloud.run("getMyInvestments", params);
     setMyInvestments(investments);
  }

  useEffect(() => {
    account && fetchMyInvestments();
  },[account, transaction]);


  const mint = async (item) => { 
    setItemId(item.id);
    setIsMinting(true);
    const optionsMint = {
      contractAddress: MagePadNFTAddress,
      functionName: "mint",
      abi: MagePadNFTABI,
      params: {
        _tokenAddress: item.tokenAddress,
        _magePadAddress: MagePadAddress,
      },
    };
    const tx = await Moralis.executeFunction(optionsMint);
    const tokenId = tx.events.Transfer.returnValues.tokenId;

    const query = new Moralis.Query("NewInvestments");
    query.equalTo("investorAddress", account);
    query.equalTo("tokenAddress", item.tokenAddress);
    let result = await query.first();
    if(result) {
        result.set("nftminted", true);
        result.set("tokenId", tokenId);
        await result.save();
    }
    setTransaction(tx);
    setIsMinting(false);
    setItemId("");
  }

  let columns = [];
  if (myInvestments) {
    columns = [
          {
      title: "Project",
      dataIndex: "project",
      key: "image",
      width: "25%",
      render: (item) => (<Image
        width={50}
        height={50}
        style={{borderRadius: "25px"}}
        src={item.attributes.image.ipfs()} />),
    },
        {
        title: "Project name",
        dataIndex: "project",
        key: "name",
        width: "25%",
        render: (item) => item.attributes.name, //data.attributes.project.attributes.name,
      },
      {
      title: "Token name",
      dataIndex: "project",
      key: "tokenname",
      width: "25%",
      render: (item) => item.attributes.tokenName,
    },
    {
      title: "Locked tokens",
      dataIndex: "lockedTokens",
      key: "balance",
      width: "25%",
      render: (value, item) => (!item.nftminted ? tokenValue(value, 18).toFixed(6) : "Hourglass NFT " + item.nftId + " was minted"),
    },
    {
        title: "Mint NFT",
        dataIndex: "lockedTokens",
        key: "minting",
        width: "25%",
        render: (value, item) => { 
          if(item.id === itemId) {
            return (!item.nftminted && (
              isMinting ? <Spin /> : <Button
                onClick={() => {mint(item)}}
                style={{
                color: "orange",
                backgroundColor: "blue",
                borderRadius: "15px",
                border: "0px",
                }}
            >
                Mint
            </Button>))
          } else {
            return (!item.nftminted && <Button
                onClick={() => {mint(item)}}
                style={{
                color: "orange",
                backgroundColor: "blue",
                borderRadius: "15px",
                border: "0px",
                }}
            >
                Mint
            </Button>)
          }
        },
      },
    ];
  }

  return (
    <div
      style={{
        width: "45vw",
        backgroundColor: "rgba(50,50,50,0.6)",
        padding: "10px",
        boxshadow: "20px 20px",
        borderRadius: "30px",
      }}
    >
      <Skeleton loading={!myInvestments}>
        <Table
          //pagination= {false}
          className="ant-table"
          title={() => (
            <h1 style={{ color: "orange" }}>{"My tokens locked in the launchpad"}</h1>
          )}
          dataSource={myInvestments}
          columns={columns}
          rowKey={(record) => {
            return record.id;
          }}
        />
      </Skeleton>
    </div>
  );
}
export default LaunchpadBalance;
