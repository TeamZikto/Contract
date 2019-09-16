const Migrations = artifacts.require("Migrations");
const InsureumToken = artifacts.require("InsureumToken");
var InsureumMultiSigAudit = artifacts.require("InsureumMultiSigAudit");
const Caver = require('caver-js');


module.exports = async function(deployer) {
  const caver = new Caver('http://' +config.env.host + ':' + 8551);
  // await caver.klay.personal.unlockAccount(config.env.address, config.env.password)
  const isr = await deployer.deploy(InsureumToken);
  console.log(isr)
  await deployer.deploy(InsureumMultiSigAudit, isr.address);
};
