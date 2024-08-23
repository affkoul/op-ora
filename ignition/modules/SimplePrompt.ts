import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SimplePromptModule = buildModule("SimplePromptModule", (m) => {
  const aiOracle = m.contractAt(
    "AIOracle",
    process.env.NEXT_PUBLIC_AI_ORACLE_ADDRESS as string,
  );
  const SimplePrompt = m.contract("SimplePrompt", [aiOracle]);

  return { SimplePrompt };
});

export default SimplePromptModule;
