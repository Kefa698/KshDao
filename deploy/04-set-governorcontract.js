const { network, ethers } = require("hardhat")
const {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    ADRESSZERO,
} = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { log } = deployments
    const { deployer } = await getNamedAccounts()
    const governor = await ethers.getContract("GovernorContract", deployer)
    const timelock = await ethers.getContract("TimeLock", deployer)
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS
    log("-----------------------------------------------------")
    log("Setting up contracts for roles...................")
    //set roles
    const proposerRole = await timelock.PROPOSER_ROLE()
    const executorRole = await timelock.EXECUTOR_ROLE()
    const adminRole = await timelock.TIMELOCK_ADMIN_ROLE()

    const proposerTx = await timelock.grantRole(proposerRole, governor.address)
    await proposerTx.waitBlockConfirmations
    const executorTx = await timelock.grantRole(executorRole, ADRESSZERO)
    await executorTx.waitBlockConfirmations
    const revokeTx = await timelock.revokeRole(adminRole, deployer)
    await revokeTx.waitBlockConfirmations
    //  Now, anything the timelock wants to do has to go through the governance process!

    log("roles set........................................")
    log("----------------------------------------------------")
}
module.exports.tags = ["all", "setupContracts"]
