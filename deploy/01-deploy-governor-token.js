const { network, ethers } = require("hardhat")
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    log("----------------------------------------------------")
    const arguments = []
    const governanceToken = await deploy("GovernanceToken", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })

    const delegate = async (governanceTokenAddress, delegatedAccount) => {
        const governanceToken = await ethers.getContractAt(
            "GovernanceToken",
            governanceTokenAddress
        )
        const tx = await governanceToken.delegate(delegatedAccount)
        await tx.waitConfirmations
        log(`checkpoints ${await governanceToken.numCheckpoints(delegatedAccount)}`)
    }
    await delegate(governanceToken.address, deployer)
    log("delegated")

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(governanceToken.address, arguments)
    }
    log("----------------------------------------------------")
}

module.exports.tags = ["all", "governorToken"]
