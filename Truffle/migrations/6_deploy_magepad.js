const MagePad = artifacts.require("MagePad");
const magePadNFTAddress = "0x68C493543E3eE338C578d1dc48371051Ebf8F04d";

module.exports = function (deployer) {
  deployer.deploy(MagePad, magePadNFTAddress);
};
