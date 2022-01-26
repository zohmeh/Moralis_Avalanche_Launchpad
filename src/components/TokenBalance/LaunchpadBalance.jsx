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
    const web3 = await Moralis.enableWeb3();
    const params = {
       MagePadABI: MagePadABI,
       MagePadAddress: MagePadAddress,
       walletAddress: account,
     }
     const investments = await Moralis.Cloud.run("getMyInvestments", params);
     for(let i = 0; i < investments.length; i++) {
       if(investments[i].nftminted) {
        const contract =  new web3.eth.Contract(MagePadNFTABI, MagePadNFTAddress);
        const nftInfo = await contract.methods.allNFTs(parseInt(investments[i].nftId)).call();
        const lockedTokens = nftInfo.tokenAmount;
        investments[i].lockedTokens = lockedTokens;
       }
     }
     console.log(investments);
     setMyInvestments(investments);
  };

  async function withdraw(item) {
    setIsMinting(true);
    const optionsWithdraw = {
      contractAddress: MagePadNFTAddress,
      functionName: "withdrawStakedAmount",
      abi: MagePadNFTABI,
      params: {
        _tokenId: item.nftId,
        _magePadAddress: MagePadAddress
      }
    };
    await Moralis.executeFunction(optionsWithdraw);
    setIsMinting(false);
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
      width: 5,
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
        width: 10,
        render: (item) => item.attributes.name, //data.attributes.project.attributes.name,
      },
      {
      title: "Token name",
      dataIndex: "project",
      key: "tokenname",
      width: 15,
      render: (item) => item.attributes.tokenName,
    },
    {
      title: "Unlocked tokens",
      dataIndex: "lockedTokens",
      key: "balance",
      width: 15,
      render: (value, item) => {
        const unlockedTokens = value * (1 / parseFloat(item.project.attributes.lockedpercentage) - 1);
        return tokenValue(unlockedTokens, parseInt(item.project.attributes.tokenDecimals)).toFixed(6);
      },
    },
    {
      title: "Locked tokens",
      dataIndex: "lockedTokens",
      key: "balance",
      width: 50,
      render: (value, item) => {
        if(item.nftminted) {
          return ("Hourglass NFT " + item.nftId + " was minted with " + tokenValue(parseInt(item.lockedTokens), parseInt(item.project.attributes.tokenDecimals)).toFixed(6) + " Tokens locked")
        }
        else {
          return (tokenValue(value, parseInt(item.project.attributes.tokenDecimals)).toFixed(6));
        }
      }
    },
    {
        title: "Mint NFT",
        dataIndex: "lockedTokens",
        key: "minting",
        width: 15,
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
            return (!item.nftminted ? <Button
                onClick={() => {mint(item)}}
                style={{
                color: "orange",
                backgroundColor: "blue",
                borderRadius: "15px",
                border: "0px",
                }}
            >
                Mint
            </Button> : <Button
                onClick={() => {withdraw(item)}}
                style={{
                color: "orange",
                backgroundColor: "blue",
                borderRadius: "15px",
                border: "0px",
                }}
            >
                Unlock tokens
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
