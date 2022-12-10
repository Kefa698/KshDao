const { expect, assert } = require("chai")
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
          describe("blacklist and unblacklisr", function () {
              it("blacklist and emits an event", async function () {
                  const blacklistedAccount = accounts[1]
                  expect(await kshcoin.blacklist(blacklistedAccount.address)).to.emit("Blacklisted")
              })
              it("unblacklist", async function () {
                  const blacklistedAccount = accounts[1]
                  await kshcoin.blacklist(blacklistedAccount.address)
                  expect(await kshcoin.unBlacklist(blacklistedAccount.address)).to.emit(
                      "UnBlacklisted"
                  )
              })
              it("blocks blacklisted acounts from approving and transfering ether", async function () {
                  const transferAmount = await ethers.utils.parseUnits("1", "ether")
                  const blacklistedAccount = accounts[1]
                  //blacklist
                  const blacklistTx = await kshcoin.blacklist(blacklistedAccount.address)
                  blacklistTx.wait(1)
                  await expect(
                      kshcoin.transfer(blacklistedAccount.address, transferAmount)
                  ).to.be.revertedWith("blacklisted")
                  await expect(
                      kshcoin.approve(blacklistedAccount.address, transferAmount)
                  ).to.be.revertedWith("blacklisted")
                  await expect(
                      kshcoin.transferFrom(
                          deployer.address,
                          blacklistedAccount.address,
                          transferAmount
                      )
                  ).to.be.revertedWith("blacklisted")
              })
          })
          describe("minter settings", function () {
              it("configures minter and emits an event", async function () {
                  const mintAmount = ethers.utils.parseUnits("100", "ether")
                  expect(await kshcoin.configureMinter(deployer.address, mintAmount)).to.emit(
                      "MinterConfigured"
                  )
              })
              it("removes minter", async function () {
                  const mintAmount = ethers.utils.parseUnits("100", "ether")
                  await kshcoin.configureMinter(deployer.address, mintAmount)
                  //minter removed
                  expect(await kshcoin.removeMinter(deployer.address)).to.emit("MinterRemoved")
              })
              it("allows minters to mint", async function () {
                  const startingBalance = await kshcoin.balanceOf(deployer.address)
                  const mintAmount = ethers.utils.parseUnits("100", "ether")
                  const configureMinterTx = await kshcoin.configureMinter(
                      deployer.address,
                      mintAmount
                  )
                  await configureMinterTx.wait(1)
                  const mintTx = await kshcoin.mint(deployer.address, mintAmount)
                  await mintTx.wait(1)
                  const endingBalance = await kshcoin.balanceOf(deployer.address)
                  assert.equal(endingBalance.sub(startingBalance).toString(), mintAmount.toString())
              })
              it("blocks non minter", async function () {
                  const mintAmount = ethers.utils.parseUnits("100", "ether")
                  await kshcoin.connect(badActor.address)
                  await expect(kshcoin.mint(badActor.address, mintAmount)).to.revertedWith(
                      "not minter"
                  )
              })
          })
      })
