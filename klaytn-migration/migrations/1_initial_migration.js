const Migrations = artifacts.require("Migrations");
const InsureumToken = artifacts.require("InsureumToken");

module.exports = async function(deployer) {
  await deployer.deploy(Migrations);
  await deployer.deploy(InsureumToken);
    // return deployer.deploy(InsureumMultiSigAudit, instance.address, {from:creator});
    // return deployer.deploy(InsureumMultiSigAudit, instance.address);
// });
};
