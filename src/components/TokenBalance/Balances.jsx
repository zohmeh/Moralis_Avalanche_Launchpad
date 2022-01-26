import ERC20Balance from "./ERC20Balance";
import LaunchpadBalance from "./LaunchpadBalance";

function Balances() {
  
  return (  
    <div style={{display: "flex", flexDirection: "row", gap: "50px"}}>
    <ERC20Balance />
    <LaunchpadBalance />
    </div>
  );
}
export default Balances;
