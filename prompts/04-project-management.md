# Prompt 4: Project Management System

## Overview
Core project creation and lifecycle management with state machine transitions.

## Requirements

### Project Model
- Project details (title, description, budget)
- Status tracking
- Escrow integration
- Delivery management

### State Machine
```
CREATED → FUNDED → ACCEPTED → IN_PROGRESS 
→ DELIVERED → REVIEWED → COMPLETED
```

### Eligibility System
- New providers: 1 active project max
- Established providers: unlimited
- Review completion required

### API Endpoints
- Create, fund, accept project
- Deliver, approve, dispute
- Browse available projects

See full prompt for complete implementation.
