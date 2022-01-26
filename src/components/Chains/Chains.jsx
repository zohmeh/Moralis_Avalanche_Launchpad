import { useEffect, useState } from "react";
import { Button } from "antd";
import { AvaxLogo } from "./Logos";
import { useChain } from "react-moralis";

const styles = {
  item: {
    display: "flex",
    alignItems: "center",
    height: "42px",
    fontWeight: "500",
    fontFamily: "Roboto, sans-serif",
    fontSize: "14px",
    padding: "0 10px",
    background: "transparent",
    color: "orange"
  },
  button: {
    border: "0px solid rgb(231, 234, 243)",
    borderRadius: "12px",
  },
};

const menuItems = [
  /*{
    key: "0xa86a",
    value: "Avalanche",
    icon: <AvaxLogo />,
  },*/
  {
    key: "0xa869",
    value: "Avalanche Testnet",
    icon: <AvaxLogo />,
  },
];

function Chains() {
  const { switchNetwork, chainId } = useChain();
  const [selected, setSelected] = useState({});

  useEffect(() => {
    if (!chainId) return null;
    const newSelected = menuItems.find((item) => item.key === chainId);
    setSelected(newSelected);
    console.log("current chainId: ", chainId);
  }, [chainId]);

  const handleMenuClick = (e) => {
    console.log("switch to: ", e.key);
    switchNetwork(e.key);
  };

  return (
    <div>
      {/*<Dropdown overlay={menu} trigger={["click"]}>*/}
        <Button key={selected?.key} icon={selected?.icon} style={{ ...styles.button, ...styles.item }}>
          <span style={{ marginLeft: "5px" }}>{selected?.value}</span>
          {/*<DownOutlined />*/}
        </Button>
      {/*</Dropdown>*/}
    </div>
  );
}

export default Chains;
