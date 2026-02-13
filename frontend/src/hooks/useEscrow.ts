import { useEffect, useState, useMemo } from 'react';
import { useWallets, useAccount } from '@particle-network/connectkit';
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { AnchorProvider, Program, BN, Idl } from '@coral-xyz/anchor';
import { IDL, Openhands } from '../anchor/idl';

// Placeholder Program ID
const PROGRAM_ID = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
const NETWORK = "https://api.devnet.solana.com";

export const useEscrow = () => {
  const [primaryWallet] = useWallets();
  const { isConnected, chain } = useAccount();
  const [program, setProgram] = useState<Program<any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const provider = useMemo(() => {
    if (!primaryWallet || !isConnected) return null;
    
    // Check if connected to Solana
    if (chain?.name?.toLowerCase() !== 'solana') return null;

    const connection = new Connection(NETWORK, "processed");
    const walletAdapter = primaryWallet.connector?.getProvider();
    
    if (!walletAdapter) return null;

    const anchorWallet = {
      publicKey: new PublicKey(primaryWallet.accounts[0]),
      signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
         // @ts-ignore
         return await walletAdapter.signTransaction(tx);
      },
      signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
         // @ts-ignore
         return await walletAdapter.signAllTransactions(txs);
      }
    };

    return new AnchorProvider(connection, anchorWallet, { preflightCommitment: "processed" });
  }, [primaryWallet, isConnected, chain]);

  useEffect(() => {
    if (provider) {
      try {
        // Cast IDL to any to satisfy type constraints if strict checking fails
        const prog = new Program(IDL as unknown as Idl, provider);
        // Cast program back to typed version
        setProgram(prog as any);
      } catch (e) {
        console.error("Failed to initialize Anchor program", e);
      }
    }
  }, [provider]);

  const initializeEscrow = async (amount: number, commissionId: string) => {
    if (!program || !provider) throw new Error("Wallet not connected");
    setLoading(true);
    setError(null);
    try {
      const amountBN = new BN(amount);
      
      // Derive Escrow PDA
      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), provider.wallet.publicKey.toBuffer()],
        program.programId
      );

      // We need a mint for the token (e.g., USDC). For now, we'll use a dummy mint or native SOL wrapper.
      // But the contract expects a token transfer.
      // If we want to support native SOL, we need to wrap it.
      // For this implementation, let's assume we are using a specific Mint (e.g. USDC Devnet)
      // For simplicity in this demo, I will mock the mint address.
      const MINT_ADDRESS = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"); // USDC Devnet

      // Also need token accounts.
      // This part gets complex without creating associated token accounts.
      // I will simplify and just call the RPC, assuming the accounts exist or are created.
      
      // REAL IMPLEMENTATION NOTE:
      // In a real app, we would need to:
      // 1. Get the user's ATA for the mint.
      // 2. Create the escrow's ATA (or let the program do it).
      
      // Since the contract initializes the escrow token account, we pass it.
      
      // For the purpose of this task (mock/skeleton), I will just log the action.
      console.log("Initializing Escrow on-chain...", { amount, commissionId, escrowPda: escrowPda.toString() });
      
      // Actual call (commented out until contract is deployed)
      /*
      const tx = await program.methods.initializeEscrow(amountBN)
        .accounts({
           requester: provider.wallet.publicKey,
           requesterTokenAccount: ...,
           escrowAccount: escrowPda,
           escrowTokenAccount: ...,
           mint: MINT_ADDRESS,
           systemProgram: SystemProgram.programId,
           tokenProgram: TOKEN_PROGRAM_ID,
           rent: web3.SYSVAR_RENT_PUBKEY
        })
        .rpc();
      return tx;
      */
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1000));
      return "mock_tx_signature_init";

    } catch (err: any) {
      console.error(err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const acceptProject = async (requesterAddress: string) => {
    if (!program || !provider) throw new Error("Wallet not connected");
    setLoading(true);
    try {
        const requesterPubkey = new PublicKey(requesterAddress);
        const [escrowPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("escrow"), requesterPubkey.toBuffer()],
            program.programId
        );

        console.log("Accepting Project on-chain...", { escrowPda: escrowPda.toString() });

        /*
        const tx = await program.methods.acceptProject()
            .accounts({
                provider: provider.wallet.publicKey,
                escrowAccount: escrowPda
            })
            .rpc();
        return tx;
        */
       await new Promise(resolve => setTimeout(resolve, 1000));
       return "mock_tx_signature_accept";
    } catch (err: any) {
        setError(err.message);
        throw err;
    } finally {
        setLoading(false);
    }
  };

  const deliverProject = async (requesterAddress: string) => {
    if (!program || !provider) throw new Error("Wallet not connected");
    setLoading(true);
    try {
        const requesterPubkey = new PublicKey(requesterAddress);
        // Escrow PDA seeded by requester
        const [escrowPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("escrow"), requesterPubkey.toBuffer()],
            program.programId
        );
        
        console.log("Delivering Project on-chain...", { escrowPda: escrowPda.toString() });
        
        /*
        const tx = await program.methods.deliverProject()
            .accounts({
                provider: provider.wallet.publicKey,
                escrowAccount: escrowPda
            })
            .rpc();
        return tx;
        */
       await new Promise(resolve => setTimeout(resolve, 1000));
       return "mock_tx_signature_deliver";
    } catch (err: any) {
        setError(err.message);
        throw err;
    } finally {
        setLoading(false);
    }
  };

  const releasePayment = async () => {
      if (!program || !provider) throw new Error("Wallet not connected");
      setLoading(true);
      try {
          const [escrowPda] = PublicKey.findProgramAddressSync(
              [Buffer.from("escrow"), provider.wallet.publicKey.toBuffer()],
              program.programId
          );
          
          console.log("Releasing Payment on-chain...");
          /*
          const tx = await program.methods.releasePayment()
            .accounts({
                requester: provider.wallet.publicKey,
                escrowAccount: escrowPda,
                // ... token accounts
            })
            .rpc();
          return tx;
          */
         await new Promise(resolve => setTimeout(resolve, 1000));
         return "mock_tx_signature_release";
      } catch (err: any) {
          setError(err.message);
          throw err;
      } finally {
          setLoading(false);
      }
  };

  const cancelEscrow = async () => {
    if (!program || !provider) throw new Error("Wallet not connected");
    setLoading(true);
    try {
        const [escrowPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("escrow"), provider.wallet.publicKey.toBuffer()],
            program.programId
        );
        console.log("Cancelling Escrow on-chain...");
        /*
        const tx = await program.methods.cancelEscrow()
            .accounts({
                requester: provider.wallet.publicKey,
                escrowAccount: escrowPda,
                // ... token accounts
            })
            .rpc();
        return tx;
        */
        await new Promise(resolve => setTimeout(resolve, 1000));
        return "mock_tx_signature_cancel";
    } catch (err: any) {
        setError(err.message);
        throw err;
    } finally {
        setLoading(false);
    }
  };

  const submitReview = async (score: number, comment: string, providerAddress: string) => {
    if (!program || !provider) throw new Error("Wallet not connected");
    setLoading(true);
    try {
        const providerPubkey = new PublicKey(providerAddress);
        // Derive Escrow PDA (Assuming I am the requester)
        const [escrowPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("escrow"), provider.wallet.publicKey.toBuffer()],
            program.programId
        );
        
        // Derive Review PDA
        const [reviewPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("review"), escrowPda.toBuffer()],
            program.programId
        );
        
        console.log("Submitting Review on-chain...", { score, comment, reviewPda: reviewPda.toString() });
        
        /*
        const tx = await program.methods.submitReview(score, comment)
           .accounts({
               reviewer: provider.wallet.publicKey,
               reviewee: providerPubkey,
               escrowAccount: escrowPda,
               reviewAccount: reviewPda,
               systemProgram: SystemProgram.programId
           })
           .rpc();
        return tx;
        */
       await new Promise(resolve => setTimeout(resolve, 1000));
       return "mock_tx_signature_review";
    } catch (err: any) {
        setError(err.message);
        throw err;
    } finally {
        setLoading(false);
    }
  };

  return {
    initializeEscrow,
    acceptProject,
    deliverProject,
    releasePayment,
    cancelEscrow,
    submitReview,
    loading,
    error,
    program
  };
};
