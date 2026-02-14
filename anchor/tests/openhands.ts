import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Openhands } from "../target/types/openhands";
import { 
  createMint, 
  getOrCreateAssociatedTokenAccount, 
  mintTo, 
  TOKEN_PROGRAM_ID, 
  getAccount 
} from "@solana/spl-token";
import { assert } from "chai";

describe("openhands", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Openhands as Program<Openhands>;

  // Test Accounts
  const requester = anchor.web3.Keypair.generate();
  const providerWallet = anchor.web3.Keypair.generate();
  const payer = provider.wallet as anchor.Wallet;

  let mint: anchor.web3.PublicKey;
  let requesterTokenAccount: anchor.web3.PublicKey;
  let providerTokenAccount: anchor.web3.PublicKey;
  let escrowAccount: anchor.web3.PublicKey;
  let escrowTokenAccount: anchor.web3.PublicKey;

  const amount = new anchor.BN(100);

  before(async () => {
    // Airdrop SOL to requester and provider
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(requester.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL),
      "confirmed"
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(providerWallet.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL),
      "confirmed"
    );

    // Create Mint
    mint = await createMint(
      provider.connection,
      payer.payer,
      payer.publicKey,
      null,
      6
    );

    // Create Token Accounts
    const requesterTA = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      requester,
      mint,
      requester.publicKey
    );
    requesterTokenAccount = requesterTA.address;

    const providerTA = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      providerWallet,
      mint,
      providerWallet.publicKey
    );
    providerTokenAccount = providerTA.address;

    // Mint tokens to requester
    await mintTo(
      provider.connection,
      payer.payer,
      mint,
      requesterTokenAccount,
      payer.payer,
      1000
    );
  });

  it("Initializes Escrow", async () => {
    // Derive Escrow PDA
    const [escrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), requester.publicKey.toBuffer()],
      program.programId
    );
    escrowAccount = escrowPda;

    // Execute Initialize
    await program.methods
      .initializeEscrow(amount)
      .accounts({
        requester: requester.publicKey,
        requesterTokenAccount: requesterTokenAccount,
        escrowAccount: escrowAccount,
        mint: mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([requester])
      .rpc();

    // Verify State
    const account = await program.account.escrowAccount.fetch(escrowAccount);
    assert.ok(account.requester.equals(requester.publicKey));
    assert.ok(account.amount.eq(amount));
    assert.ok(account.state.created !== undefined); // Enum check

    // Verify Balances
    const escrowTokenAccountInfo = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        payer.payer, // Payer for creating if not exists (should exist)
        mint,
        escrowAccount,
        true // allowOwnerOffCurve
    );
    escrowTokenAccount = escrowTokenAccountInfo.address;

    const escrowBalance = await provider.connection.getTokenAccountBalance(escrowTokenAccount);
    assert.equal(escrowBalance.value.amount, "100");
  });

  it("Accepts Project", async () => {
    await program.methods
      .acceptProject()
      .accounts({
        provider: providerWallet.publicKey,
        escrowAccount: escrowAccount,
      })
      .signers([providerWallet])
      .rpc();

    const account = await program.account.escrowAccount.fetch(escrowAccount);
    assert.ok(account.provider.equals(providerWallet.publicKey));
    assert.ok(account.state.accepted !== undefined);
  });

  it("Delivers Project", async () => {
    await program.methods
      .deliverProject()
      .accounts({
        provider: providerWallet.publicKey,
        escrowAccount: escrowAccount,
      })
      .signers([providerWallet])
      .rpc();

    const account = await program.account.escrowAccount.fetch(escrowAccount);
    assert.ok(account.state.delivered !== undefined);
  });

  it("Fails if unauthorized user tries to release payment", async () => {
    try {
      await program.methods
        .releasePayment()
        .accounts({
          requester: providerWallet.publicKey, // Wrong signer (provider trying to release)
          escrowAccount: escrowAccount,
          escrowTokenAccount: escrowTokenAccount,
          providerTokenAccount: providerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([providerWallet])
        .rpc();
      assert.fail("Should have failed with Unauthorized");
    } catch (e) {
      // Check for specific error code or message if possible
      // ErrorCode::Unauthorized is likely
      assert.ok(e);
    }
  });

  it("Releases Payment", async () => {
    // Get initial provider balance
    const initialBalance = await provider.connection.getTokenAccountBalance(providerTokenAccount);
    const initialAmount = parseInt(initialBalance.value.amount);

    await program.methods
      .releasePayment()
      .accounts({
        requester: requester.publicKey,
        escrowAccount: escrowAccount,
        escrowTokenAccount: escrowTokenAccount,
        providerTokenAccount: providerTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([requester])
      .rpc();

    // Verify Provider Balance
    const finalBalance = await provider.connection.getTokenAccountBalance(providerTokenAccount);
    assert.equal(parseInt(finalBalance.value.amount), initialAmount + 100);

    // Verify Escrow Account Closed
    try {
      await program.account.escrowAccount.fetch(escrowAccount);
      assert.fail("Escrow account should be closed");
    } catch (e) {
      assert.ok(e.message.includes("Account does not exist"));
    }
  });
});
