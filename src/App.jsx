import { useEffect } from "react";
import { useMoralis } from "react-moralis";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Account from "components/Account";
import Chains from "components/Chains";
import NFTBalance from "components/NFTBalances/NFTBalances";
import { Layout } from "antd";
import "antd/dist/antd.css";
import "./style.css";
import MenuItems from "./components/MenuItems";
import Launchpad from "./components/Launchpad/Launchpad";
import Marketplace from "components/Marketplace/Marketplace";
import Balances from "components/TokenBalance/Balances";
const { Header } = Layout;

const styles = {
  content: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Roboto, sans-serif",
    marginTop: "50px",
    padding: "10px",
  },
  header: {
    //position: "fixed",
    zIndex: 1,
    width: "100%",
    background: "transparent",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "Roboto, sans-serif",
    //borderBottom: "2px solid rgba(0, 0, 0, 0.06)",
    padding: "0 10px",
    //boxShadow: "0 1px 10px rgb(151 164 175 / 10%)",
    //backgroundColor: "rgba(108,122,137,0.5)",
  },
  headerRight: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    fontSize: "15px",
    fontWeight: "600",
  },
};
const App = ({ isServerInfo }) => {
  const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } =
    useMoralis();

  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  return (
    //<Layout style={{ height: "100vh", overflow: "auto", background: "linear-gradient(45deg, rgba(2,0,36,1) 10%, rgba(9,9,121,1) 50%, rgba(0,212,255,1) 90%)"}}>
    <Layout
      style={{
        height: "100vh",
        overflow: "auto",
        background:
          "linear-gradient(45deg, rgba(2,0,36,1) 10%, rgba(9,9,121,1) 50%, rgba(138,43,226,1) 90%)",
      }}
    >
      <Router>
        <Header style={styles.header}>
          <MenuItems />
          <div style={styles.headerRight}>
            <Chains />
            {/*<TokenPrice
              address="0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"
              chain="eth"
              image="https://cloudflare-ipfs.com/ipfs/QmXttGpZrECX5qCyXbBQiqgQNytVGeZW5Anewvh2jc4psg/"
              size="40px"
            />
            <NativeBalance />*/}
            <Account />
          </div>
        </Header>
        <div style={styles.content}>
          {isAuthenticated ? (
            <Switch>
              <Route path="/balances">
                <Balances />
              </Route>
              <Route path="/nftBalance">
                <NFTBalance />
              </Route>
              <Route path="/launchpad">
                <Launchpad />
              </Route>
              <Route path="/marketplace">
                <Marketplace />
              </Route>
              <Route path="/">
                <Redirect to="/balances" />
              </Route>
            </Switch>
          ) : (
            <Switch>
              <Route path="/nonauthenticated">
                <h2 style={{color: "orange"}}>Please login using the "Authenticate" button</h2>
              </Route>
              <Redirect to="/nonauthenticated" />
            </Switch>
          )}
        </div>
      </Router>
    </Layout>
  );
};

export default App;
