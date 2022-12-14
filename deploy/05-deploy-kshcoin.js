const { network, ethers } = require("hardhat")
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS
    log("-------------------------------------------------------------")
    const initialSupply = ethers.utils.parseUnits("10", "ether")
    const args = [initialSupply]
    const KshCoin = await deploy("KshCoin", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying....................")
        await verify(KshCoin.address, args)
    }
    const kshContract = await ethers.getContractAt("KshCoin", KshCoin.address)
    const timeLock = await ethers.getContract("TimeLock")
    const transferTx = await kshContract.transferOwnership(timeLock.address)
    await transferTx.wait(1)

    log("-----------------------------------------------------------------------")
}
module.exports.tags = ["all", "kshcoin"]
