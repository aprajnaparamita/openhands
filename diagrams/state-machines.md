# State Machine Diagrams

## Project Status State Machine

```
     [CREATE]
         │
         ▼
    (CREATED) ─────────────────┐
         │                     │
      [FUND]                   │
         │                [CANCEL]
         ▼                     │
     (FUNDED) ─────────────────┤
         │                     │
     [ACCEPT]                  │
         │                     │
         ▼                     │
    (ACCEPTED)                 │
         │                     │
    [AUTO_PROGRESS]            │
         │                     │
         ▼                     │
  (IN_PROGRESS)                │
         │                     │
     [DELIVER]                 │
         │                     ▼
         ▼                (CANCELLED)
    (DELIVERED) ────[DISPUTE]───> (DISPUTED)
         │
   [BOTH_REVIEW]
         │
         ▼
    (REVIEWED)
         │
  [AUTO_RELEASE]
         │
         ▼
    (COMPLETED)
```

## Review Blocking State Machine

```
Provider with < 3 reviews:
    [ACCEPT_PROJECT] → Check active projects
         │
         ├─ Active > 0 → REJECT
         │
         └─ Active = 0 → Check pending reviews
                 │
                 ├─ Pending > 0 → REJECT
                 │
                 └─ Pending = 0 → ALLOW

Provider with ≥ 3 reviews:
    [ACCEPT_PROJECT] → ALLOW (no limits)
```

See feature prompts for transition details.
