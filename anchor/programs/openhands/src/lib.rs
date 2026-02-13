use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Mint, SetAuthority, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"); // Placeholder ID

#[program]
pub mod openhands {
    use super::*;

    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        amount: u64,
    ) -> Result<()> {
        // Transfer funds from requester to escrow account
        let cpi_accounts = Transfer {
            from: ctx.accounts.requester_token_account.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.requester.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        // Initialize escrow state
        let escrow_account = &mut ctx.accounts.escrow_account;
        escrow_account.requester = *ctx.accounts.requester.key;
        escrow_account.amount = amount;
        escrow_account.is_initialized = true;
        escrow_account.state = EscrowState::Created;
        escrow_account.bump = *ctx.bumps.get("escrow_account").unwrap();

        Ok(())
    }

    pub fn accept_project(ctx: Context<AcceptProject>) -> Result<()> {
        let escrow_account = &mut ctx.accounts.escrow_account;
        require!(escrow_account.state == EscrowState::Created, ErrorCode::InvalidState);

        escrow_account.provider = *ctx.accounts.provider.key;
        escrow_account.state = EscrowState::Accepted;
        
        Ok(())
    }

    pub fn deliver_project(ctx: Context<DeliverProject>) -> Result<()> {
        let escrow_account = &mut ctx.accounts.escrow_account;
        require!(escrow_account.state == EscrowState::Accepted, ErrorCode::InvalidState);
        // Only the assigned provider can deliver
        require!(escrow_account.provider == *ctx.accounts.provider.key, ErrorCode::Unauthorized);

        escrow_account.state = EscrowState::Delivered;
        Ok(())
    }

    pub fn release_payment(ctx: Context<ReleasePayment>) -> Result<()> {
        let escrow_account = &mut ctx.accounts.escrow_account;
        
        // Can be released if Delivered or if Requester wants to release early (e.g. Reviewed)
        require!(
            escrow_account.state == EscrowState::Delivered || escrow_account.state == EscrowState::Accepted, 
            ErrorCode::InvalidState
        );
        require!(escrow_account.requester == *ctx.accounts.requester.key, ErrorCode::Unauthorized);

        // Transfer funds from escrow to provider
        let seeds = &[
            b"escrow".as_ref(),
            escrow_account.requester.as_ref(),
            &[escrow_account.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.provider_token_account.to_account_info(),
            authority: escrow_account.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, escrow_account.amount)?;

        // Close the escrow account (rent recovery)
        let close_accounts = CloseAccount {
            account: ctx.accounts.escrow_token_account.to_account_info(),
            destination: ctx.accounts.requester.to_account_info(),
            authority: escrow_account.to_account_info(),
        };
        let close_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            close_accounts,
            signer,
        );
        token::close_account(close_ctx)?;

        escrow_account.state = EscrowState::Completed;

        Ok(())
    }

    pub fn cancel_escrow(ctx: Context<CancelEscrow>) -> Result<()> {
        let escrow_account = &mut ctx.accounts.escrow_account;
        
        // Can only cancel if Created (no provider assigned yet)
        require!(escrow_account.state == EscrowState::Created, ErrorCode::InvalidState);
        require!(escrow_account.requester == *ctx.accounts.requester.key, ErrorCode::Unauthorized);

        // Refund requester
        let seeds = &[
            b"escrow".as_ref(),
            escrow_account.requester.as_ref(),
            &[escrow_account.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.requester_token_account.to_account_info(),
            authority: escrow_account.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, escrow_account.amount)?;

        // Close accounts
        let close_accounts = CloseAccount {
            account: ctx.accounts.escrow_token_account.to_account_info(),
            destination: ctx.accounts.requester.to_account_info(),
            authority: escrow_account.to_account_info(),
        };
        let close_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            close_accounts,
            signer,
        );
        token::close_account(close_ctx)?;

        escrow_account.state = EscrowState::Cancelled;

        Ok(())
    }

    pub fn submit_review(ctx: Context<SubmitReview>, score: u8, comment: String) -> Result<()> {
        require!(score >= 1 && score <= 5, ErrorCode::InvalidScore);
        
        let review_account = &mut ctx.accounts.review_account;
        review_account.reviewer = *ctx.accounts.reviewer.key;
        review_account.reviewee = *ctx.accounts.reviewee.key;
        review_account.commission_id = ctx.accounts.escrow_account.key();
        review_account.score = score;
        review_account.comment = comment;
        
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct InitializeEscrow<'info> {
    #[account(mut)]
    pub requester: Signer<'info>,
    
    #[account(mut)]
    pub requester_token_account: Account<'info, TokenAccount>,

    #[account(
        init,
        seeds = [b"escrow", requester.key().as_ref()],
        bump,
        payer = requester,
        space = 8 + 32 + 32 + 8 + 1 + 1 + 1 // discriminator + requester + provider + amount + bool + enum + bump
    )]
    pub escrow_account: Account<'info, EscrowAccount>,

    #[account(
        init,
        payer = requester,
        token::mint = mint,
        token::authority = escrow_account,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct AcceptProject<'info> {
    #[account(mut)]
    pub provider: Signer<'info>,
    
    #[account(
        mut,
        constraint = escrow_account.state == EscrowState::Created
    )]
    pub escrow_account: Account<'info, EscrowAccount>,
}

#[derive(Accounts)]
pub struct DeliverProject<'info> {
    #[account(mut)]
    pub provider: Signer<'info>,
    
    #[account(
        mut,
        constraint = escrow_account.provider == *provider.key
    )]
    pub escrow_account: Account<'info, EscrowAccount>,
}

#[derive(Accounts)]
pub struct ReleasePayment<'info> {
    #[account(mut)]
    pub requester: Signer<'info>,

    #[account(
        mut,
        seeds = [b"escrow", requester.key().as_ref()],
        bump = escrow_account.bump,
        has_one = requester
    )]
    pub escrow_account: Account<'info, EscrowAccount>,

    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub provider_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CancelEscrow<'info> {
    #[account(mut)]
    pub requester: Signer<'info>,

    #[account(
        mut,
        seeds = [b"escrow", requester.key().as_ref()],
        bump = escrow_account.bump,
        has_one = requester
    )]
    pub escrow_account: Account<'info, EscrowAccount>,

    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub requester_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(score: u8, comment: String)]
pub struct SubmitReview<'info> {
    #[account(mut)]
    pub reviewer: Signer<'info>,
    
    /// CHECK: The provider being reviewed
    pub reviewee: AccountInfo<'info>, 
    
    #[account(
        constraint = escrow_account.requester == *reviewer.key,
        constraint = escrow_account.provider == *reviewee.key,
        // Allow review if Delivered (and releasing payment next) or Completed
        constraint = escrow_account.state == EscrowState::Delivered || escrow_account.state == EscrowState::Completed
    )]
    pub escrow_account: Account<'info, EscrowAccount>,
    
    #[account(
        init,
        seeds = [b"review", escrow_account.key().as_ref()],
        bump,
        payer = reviewer,
        space = 8 + 32 + 32 + 32 + 1 + 4 + 200 // Discriminator + reviewer + reviewee + commission + score + string len + string content
    )]
    pub review_account: Account<'info, ReviewAccount>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct EscrowAccount {
    pub requester: Pubkey,
    pub provider: Pubkey,
    pub amount: u64,
    pub is_initialized: bool,
    pub state: EscrowState,
    pub bump: u8,
}

#[account]
pub struct ReviewAccount {
    pub reviewer: Pubkey,
    pub reviewee: Pubkey,
    pub commission_id: Pubkey,
    pub score: u8,
    pub comment: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum EscrowState {
    Created,
    Accepted,
    Delivered,
    Completed,
    Cancelled,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The escrow is not in a valid state for this operation.")]
    InvalidState,
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
    #[msg("Review score must be between 1 and 5.")]
    InvalidScore,
}
