const { network } = require("hardhat")
const {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    VOTING_DELAY,
    VOTING_PERIOD,
    QUARAM_PERCANTAGE,
    ADRESSZERO,
} = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    const governanceToken = await get("GovernanceToken")
    const timelock = await get("TimeLock")

    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    log("----------------------------------------------------")
    const args = [
        governanceToken.address,
        timelock.address,
        VOTING_DELAY,
        VOTING_PERIOD,
        QUARAM_PERCANTAGE,
    ]
    const GovernorContract = await deploy("GovernorContract", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })
    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(GovernorContract.address, arguments)
    }
    log("----------------------------------------------------")
}
module.exports.tags = ["all", "governorcontract"]
