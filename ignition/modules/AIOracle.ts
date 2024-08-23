import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AIOracleModule = buildModule("AIOracleModule", (m) => {
  const aIOracle = m.contract("AIOracle");

  return { aIOracle };
});

export default AIOracleModule;
