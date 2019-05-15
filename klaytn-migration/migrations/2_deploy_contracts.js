const Migrations = artifacts.require("Migrations");
const InsureumToken = artifacts.require("InsureumToken");
var InsureumMultiSigAudit = artifacts.require("InsureumMultiSigAudit");

module.exports = async function(deployer) {
  const isr = await deployer.deploy(InsureumToken);
  await deployer.deploy(InsureumMultiSigAudit, isr.address);
};
