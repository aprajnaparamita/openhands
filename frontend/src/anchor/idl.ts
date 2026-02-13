export type Openhands = {
  "version": "0.1.0",
  "name": "openhands",
  "address": string,
  "metadata": {
    "name": string,
    "version": string,
    "spec": string
  },
  "instructions": [
    {
      "name": "initializeEscrow",
      "accounts": [
        { "name": "requester", "isMut": true, "isSigner": true },
        { "name": "requesterTokenAccount", "isMut": true, "isSigner": false },
        { "name": "escrowAccount", "isMut": true, "isSigner": false },
        { "name": "escrowTokenAccount", "isMut": true, "isSigner": false },
        { "name": "mint", "isMut": false, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false },
        { "name": "rent", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "amount", "type": "u64" }
      ]
    },
    {
      "name": "acceptProject",
      "accounts": [
        { "name": "provider", "isMut": true, "isSigner": true },
        { "name": "escrowAccount", "isMut": true, "isSigner": false }
      ],
      "args": []
    },
    {
      "name": "deliverProject",
      "accounts": [
        { "name": "provider", "isMut": true, "isSigner": true },
        { "name": "escrowAccount", "isMut": true, "isSigner": false }
      ],
      "args": []
    },
    {
      "name": "releasePayment",
      "accounts": [
        { "name": "requester", "isMut": true, "isSigner": true },
        { "name": "escrowAccount", "isMut": true, "isSigner": false },
        { "name": "escrowTokenAccount", "isMut": true, "isSigner": false },
        { "name": "providerTokenAccount", "isMut": true, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false }
      ],
      "args": []
    },
    {
      "name": "cancelEscrow",
      "accounts": [
        { "name": "requester", "isMut": true, "isSigner": true },
        { "name": "escrowAccount", "isMut": true, "isSigner": false },
        { "name": "escrowTokenAccount", "isMut": true, "isSigner": false },
        { "name": "requesterTokenAccount", "isMut": true, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false }
      ],
      "args": []
    },
    {
      "name": "submitReview",
      "accounts": [
        { "name": "reviewer", "isMut": true, "isSigner": true },
        { "name": "reviewee", "isMut": false, "isSigner": false },
        { "name": "escrowAccount", "isMut": false, "isSigner": false },
        { "name": "reviewAccount", "isMut": true, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "score", "type": "u8" },
        { "name": "comment", "type": "string" }
      ]
    }
  ],
  "accounts": [
    {
      "name": "EscrowAccount",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "requester", "type": "publicKey" },
          { "name": "provider", "type": "publicKey" },
          { "name": "amount", "type": "u64" },
          { "name": "isInitialized", "type": "bool" },
          { "name": "state", "type": { "defined": "EscrowState" } },
          { "name": "bump", "type": "u8" }
        ]
      }
    },
    {
      "name": "ReviewAccount",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "reviewer", "type": "publicKey" },
          { "name": "reviewee", "type": "publicKey" },
          { "name": "commissionId", "type": "publicKey" },
          { "name": "score", "type": "u8" },
          { "name": "comment", "type": "string" }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "EscrowState",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "Created" },
          { "name": "Accepted" },
          { "name": "Delivered" },
          { "name": "Completed" },
          { "name": "Cancelled" }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidState",
      "msg": "The escrow is not in a valid state for this operation."
    },
    {
      "code": 6001,
      "name": "Unauthorized",
      "msg": "You are not authorized to perform this action."
    },
    {
      "code": 6002,
      "name": "InvalidScore",
      "msg": "Review score must be between 1 and 5."
    }
  ]
};

export const IDL: Openhands = {
  "version": "0.1.0",
  "name": "openhands",
  "address": "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS",
  "metadata": {
    "name": "openhands",
    "version": "0.1.0",
    "spec": "0.1.0"
  },
  "instructions": [
    {
      "name": "initializeEscrow",
      "accounts": [
        { "name": "requester", "isMut": true, "isSigner": true },
        { "name": "requesterTokenAccount", "isMut": true, "isSigner": false },
        { "name": "escrowAccount", "isMut": true, "isSigner": false },
        { "name": "escrowTokenAccount", "isMut": true, "isSigner": false },
        { "name": "mint", "isMut": false, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false },
        { "name": "rent", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "amount", "type": "u64" }
      ]
    },
    {
      "name": "acceptProject",
      "accounts": [
        { "name": "provider", "isMut": true, "isSigner": true },
        { "name": "escrowAccount", "isMut": true, "isSigner": false }
      ],
      "args": []
    },
    {
      "name": "deliverProject",
      "accounts": [
        { "name": "provider", "isMut": true, "isSigner": true },
        { "name": "escrowAccount", "isMut": true, "isSigner": false }
      ],
      "args": []
    },
    {
      "name": "releasePayment",
      "accounts": [
        { "name": "requester", "isMut": true, "isSigner": true },
        { "name": "escrowAccount", "isMut": true, "isSigner": false },
        { "name": "escrowTokenAccount", "isMut": true, "isSigner": false },
        { "name": "providerTokenAccount", "isMut": true, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false }
      ],
      "args": []
    },
    {
      "name": "cancelEscrow",
      "accounts": [
        { "name": "requester", "isMut": true, "isSigner": true },
        { "name": "escrowAccount", "isMut": true, "isSigner": false },
        { "name": "escrowTokenAccount", "isMut": true, "isSigner": false },
        { "name": "requesterTokenAccount", "isMut": true, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false }
      ],
      "args": []
    },
    {
      "name": "submitReview",
      "accounts": [
        { "name": "reviewer", "isMut": true, "isSigner": true },
        { "name": "reviewee", "isMut": false, "isSigner": false },
        { "name": "escrowAccount", "isMut": false, "isSigner": false },
        { "name": "reviewAccount", "isMut": true, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "score", "type": "u8" },
        { "name": "comment", "type": "string" }
      ]
    }
  ],
  "accounts": [
    {
      "name": "EscrowAccount",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "requester", "type": "publicKey" },
          { "name": "provider", "type": "publicKey" },
          { "name": "amount", "type": "u64" },
          { "name": "isInitialized", "type": "bool" },
          { "name": "state", "type": { "defined": "EscrowState" } },
          { "name": "bump", "type": "u8" }
        ]
      }
    },
    {
      "name": "ReviewAccount",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "reviewer", "type": "publicKey" },
          { "name": "reviewee", "type": "publicKey" },
          { "name": "commissionId", "type": "publicKey" },
          { "name": "score", "type": "u8" },
          { "name": "comment", "type": "string" }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "EscrowState",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "Created" },
          { "name": "Accepted" },
          { "name": "Delivered" },
          { "name": "Completed" },
          { "name": "Cancelled" }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidState",
      "msg": "The escrow is not in a valid state for this operation."
    },
    {
      "code": 6001,
      "name": "Unauthorized",
      "msg": "You are not authorized to perform this action."
    },
    {
      "code": 6002,
      "name": "InvalidScore",
      "msg": "Review score must be between 1 and 5."
    }
  ]
};
