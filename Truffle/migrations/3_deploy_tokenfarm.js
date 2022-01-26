const TokenFarm = artifacts.require("TokenFarm");
const mageTokenAddress = "0xb3850712Fd66FE4709f801E2fbF9a3Fc6AE728fE";

module.exports = function (deployer) {
  deployer.deploy(TokenFarm, mageTokenAddress);
};
