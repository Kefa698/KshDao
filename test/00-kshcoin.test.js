const { expect } = require("chai")
const { network, ethers, deployments } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("kshcoin unit tests", function () {
          let deployer, badActor, accounts, kshcoin
          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              badActor = accounts[1]
              await deployments.fixture(["kshcoin"])
              kshcoin = await ethers.getContract("KshCoin")
          })
          describe("blacklist", function () {
              it("blacklist and emits an event", async function () {
                  const blacklistedAccount = accounts[1]
                  expect(await kshcoin.blacklist(blacklistedAccount.address)).to.emit("Blacklisted")
              })
          })
      })
