const Migrations = artifacts.require("Migrations");
const InsureumToken = artifacts.require("InsureumToken");

const Caver = require('caver-js');

const config = require('../config');

module.exports = async function(deployer) {
  if( config.env.password ){
    try{
      // const caver = new Caver('http://' +config.env.host + ':' + 8551);
      // await caver.klay.personal.unlockAccount(config.env.address, config.env.password)
      await deployer.deploy(Migrations);
    } catch (e){
      console.log(e)
    }
  }
};
