import React, { useState, useEffect } from "react";
import { useMoralis } from "react-moralis";
import { Card, Image, Button, InputNumber, Spin } from "antd";
import { Moralis } from "moralis";
import { MagePadAddress, MagePadABI } from "../../helpers/contractABI";
import { DateConverted } from "../../helpers/formatters";
import { Liquid } from "@ant-design/plots";

Moralis.start({
  serverUrl: process.env.REACT_APP_MORALIS_SERVER_URL,
  appId: process.env.REACT_APP_MORALIS_APPLICATION_ID,
});

function Project({ project, index }) {
  const { Moralis, account } = useMoralis();
  const [tokenAmount, setTokenAmount] = useState();
  const [availableTokenToInvest, setAvailableTokenToInvest] = useState("");
  const [percentage, setPercentage] = useState("");
  const [transaction, setTransaction] = useState("");
  const [isInvesting, setIsInvesting] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [tokenUnlocked, setTokenUnlocked] = useState(false);
  const [launchending, setLaunchending] = useState(
    Date.now() >=
      project.attributes.launchduration * 60 * 60 * 1000 +
        project.attributes.projectCreation
  );

  const fetchProjectTokenBalance = async function () {
    const web3 = await Moralis.enableWeb3();
    const contract = new web3.eth.Contract(MagePadABI, MagePadAddress);
    const projectTokenBalance = await contract.methods
      .projects(project.attributes.tokenAddress)
      .call();
    const availableToken =
      parseInt(projectTokenBalance.launchingTokenBalance) /
      10 ** parseInt(project.attributes.tokenDecimals);
    const _percentage = availableToken / project.attributes.tokenAmount;
    setAvailableTokenToInvest(availableToken.toFixed(6));
    setPercentage(_percentage);
    setTokenUnlocked(projectTokenBalance.allowUnlocking);
  };

  let config;
  if (percentage !== "") {
    config = {
      percent: percentage,
      shape: "circle",
      outline: {
        border: 2,
        distance: 4,
      },
      wave: {
        length: 128,
      },
    };
  }

  useEffect(() => {
    fetchProjectTokenBalance();
  }, [transaction]);

  const invest = async function () {
    setIsInvesting(true);
    const web3 = new Moralis.Web3();
    const sendingAVAX =
      (parseFloat(tokenAmount) *
        10 ** parseFloat(project.attributes.tokenDecimals)) /
      (project.attributes.conversionRate *
        10 ** parseFloat(project.attributes.tokenDecimals));

    const optionsInvest = {
      contractAddress: MagePadAddress,
      functionName: "invest",
      abi: MagePadABI,
      msgValue: web3.utils.toWei(sendingAVAX.toString(), "ether"),
      params: {
        _tokenAddress: project.attributes.tokenAddress,
        _amount: (
          parseFloat(tokenAmount) *
          10 ** parseFloat(project.attributes.tokenDecimals)
        ).toString(),
      },
    };
    const tx = await Moralis.executeFunction(optionsInvest);

    const Investment = Moralis.Object.extend("NewInvestments");
    const investment = new Investment();

    investment.set("investorAddress", account);
    investment.set("tokenAddress", project.attributes.tokenAddress);
    investment.set("investmentCreation", Date.now());

    await investment.save();
    setIsInvesting(false);
    setTransaction(tx);
  };

  const unlockTokens = async function () {
    setIsUnlocking(true);
    const web3 = new Moralis.Web3();
    const optionsUnlock = {
      contractAddress: MagePadAddress,
      functionName: "unlockTokens",
      abi: MagePadABI,
      params: {
        _tokenAddress: project.attributes.tokenAddress,
      },
    };
    const tx = await Moralis.executeFunction(optionsUnlock);

    setTransaction(tx);
    setIsUnlocking(false);
  };

  const withdraw = async function () {
    setIsUnlocking(true);
    const web3 = new Moralis.Web3();
    const optionsWithdraw = {
      contractAddress: MagePadAddress,
      functionName: "withdrawFunds",
      abi: MagePadABI,
      params: {
        _tokenAddress: project.attributes.tokenAddress,
      },
    };
    const tx = await Moralis.executeFunction(optionsWithdraw);

    setTransaction(tx);
    setIsUnlocking(false);
  };

  return (
    <Card
      hoverable
      bordered={false}
      style={{
        width: 490,
        backgroundColor: "rgba(50,50,50,0.6)",
        padding: "10px",
        boxshadow: "20px 20px",
        borderRadius: "30px",
        color: "white",
      }}
      cover={
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              color: "orange",
            }}
          >
            <h2 style={{ color: "orange" }}>{project.attributes.name}</h2>
            <p style={{ color: "orange" }}>
              {"1 AVAX = " +
                project.attributes.conversionRate +
                " " +
                project.attributes.tokenSymbol}
            </p>
            <p style={{ color: "orange" }}>{project.attributes.description}</p>
          </div>
          <Image
            width={100}
            height={100}
            style={{ borderRadius: "50px" }}
            src={project.attributes.image.ipfs()}
          />
        </div>
      }
      //key={nft.id}
    >
      <div
        style={{ display: "flex", flexDirection: "column", color: "orange" }}
      >
        <p>Token: {project.attributes.tokenName}</p>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            width: "570px",
          }}
        >
          <p>
            Available Token amount:{" "}
            {availableTokenToInvest !== "" &&
              availableTokenToInvest + " / " + project.attributes.tokenAmount}
          </p>
          <div style={{ height: "150px", position: "relative", zIndex: "0" }}>
            <Liquid {...config} />
          </div>
        </div>
        <p>
          Launchending:{" "}
          {DateConverted(
            project.attributes.projectCreation +
              parseFloat(project.attributes.launchduration) *
                24 *
                60 *
                60 *
                1000
          )}
        </p>
        <p>
          Token percentage locked :{" "}
          {(parseFloat(project.attributes.lockedpercentage) * 100).toString() +
            " %"}{" "}
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
          <p style={{ color: "orange" }}> Token amount you want to invest in</p>
          <InputNumber
            defaultValue={0}
            onChange={(value) => setTokenAmount(value)}
          />
          {isInvesting ? (
            <Spin />
          ) : (
            <Button
              onClick={invest}
              style={{
                color: "orange",
                backgroundColor: "blue",
                borderRadius: "15px",
                border: "0px",
              }}
            >
              Invest
            </Button>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
          {isUnlocking ? (
            <Spin />
          ) : (
            <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
              {!tokenUnlocked && project.attributes.projectCreator == account && launchending &&(
                <Button
                  onClick={unlockTokens}
                  style={{
                    color: "orange",
                    backgroundColor: "blue",
                    borderRadius: "15px",
                    border: "0px",
                  }}
                >
                  Unlock Tokens
                </Button>
              )}

              {launchending && project.attributes.projectCreator == account && (
                <Button
                  onClick={withdraw}
                  style={{
                    color: "orange",
                    backgroundColor: "blue",
                    borderRadius: "15px",
                    border: "0px",
                  }}
                >
                  Withdraw tokens
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default Project;
