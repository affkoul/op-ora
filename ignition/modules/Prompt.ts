import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PromptModule = buildModule("PromptModule", (m) => {
  const aiOracle = m.contractAt(
    "AIOracle",
    process.env.NEXT_PUBLIC_AI_ORACLE_ADDRESS as string,
  );
  const Prompt = m.contract("Prompt", [aiOracle]);

  return { Prompt };
});

export default PromptModule;
