const MageToken = artifacts.require("MageToken");

module.exports = function (deployer) {
  deployer.deploy(MageToken);
};
