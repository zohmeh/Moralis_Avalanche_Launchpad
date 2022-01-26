const MagePadNFT = artifacts.require("MagePadNFT");
const mageTokenAddress = "0xb3850712Fd66FE4709f801E2fbF9a3Fc6AE728fE";
const marketPlaceAddress = "0x9Bb93dF212f4c98EFCBe3715dBfcc8D03384d9EF";

module.exports = function (deployer) {
  deployer.deploy(MagePadNFT, mageTokenAddress, marketPlaceAddress);
};
