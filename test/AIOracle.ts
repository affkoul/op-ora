import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { AIOracle } from "../typechain-types";
import { ContractTransactionResponse } from "ethers";

describe("AIOracle", function () {
  // We define a fixture to reuse the same setup in every test.
  async function deployAIOracleFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const AIOracle = await hre.ethers.getContractFactory("AIOracle");
    const aIOracle = await AIOracle.deploy();

    return { aIOracle, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { aIOracle, owner } = await loadFixture(deployAIOracleFixture);

      expect(await aIOracle.owner()).to.equal(owner.address);
    });
  });

  describe("Withdrawals", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called from another account", async function () {
        const { aIOracle, otherAccount } = await loadFixture(
          deployAIOracleFixture,
        );

        // We use .connect() to send a transaction from another account
        await expect(
          aIOracle.connect(otherAccount).withdraw(),
        ).to.be.revertedWith("Not the owner");
      });

      it("Shouldn't fail if the owner calls it", async function () {
        const { aIOracle } = await loadFixture(deployAIOracleFixture);

        await expect(aIOracle.withdraw()).not.to.be.reverted;
      });
    });

    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { aIOracle } = await loadFixture(deployAIOracleFixture);

        await expect(aIOracle.withdraw())
          .to.emit(aIOracle, "Withdrawal")
          .withArgs(anyValue, anyValue); // We accept any value for amount and when
      });
    });
  });
});
