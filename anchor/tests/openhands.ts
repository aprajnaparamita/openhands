import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Openhands } from "../target/types/openhands";

describe("openhands", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Openhands as Program<Openhands>;

  it("Is initialized!", async () => {
    // Add test here.
    const tx = await program.methods.initializeEscrow(new anchor.BN(100)).rpc();
    console.log("Your transaction signature", tx);
  });
});
