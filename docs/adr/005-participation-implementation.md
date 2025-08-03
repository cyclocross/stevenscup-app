# ADR 005: Participation Implementation

**Date:** 05.08.2025 15:00  
**Status:** Implemented  
**Deciders:** Development Team  

## Context

The participation system needs to handle the complete lifecycle of a participant in a race, from registration through completion. This includes:

1. **Status Management**: Tracking whether a participant is registered, started, or finished
2. **Position Assignment**: Automatically assigning finishing positions as participants complete the race
3. **Position Reordering**: Allowing manual adjustment of finishing positions
4. **Point Calculation**: Calculating points based on participation status and finishing position
5. **Data Integrity**: Ensuring consistent state across all participation records

## Decision

Implement a comprehensive participation management system with the following key design decisions:

### Status Cycling Logic

**Three-State Cycle**: registered → started → finished → registered (reset)

- **registered**: Participant is assigned to race but hasn't started
- **started**: Participant has begun the race
- **finished**: Participant has completed the race and receives a position

**Key Principles**:
- Status transitions follow a predictable cycle
- When transitioning to "finished", position is automatically assigned
- When resetting from "finished" to "registered", position is cleared and remaining positions are reordered

### Position Management

**Automatic Position Assignment**:
- Positions are assigned sequentially (1, 2, 3, ...) as participants finish
- Only finished participations receive positions
- Position assignment happens automatically when status changes to "finished"

**Manual Position Adjustment**:
- Finished participations can be moved up or down in position
- Position changes trigger automatic reordering of remaining positions
- Only finished participations can be reordered

**Position Reordering Logic**:
- When a participation is removed from finished status, remaining positions are reordered
- Sequential positioning (1, 2, 3, ...) is maintained at all times
- Position swaps maintain data integrity during manual adjustments

### Point Calculation System

**Point Structure**:
- **Participation Points**: 2 points for starting the race
- **Position Points**: Variable points based on finishing position
  - 1st: 20 points, 2nd: 17 points, 3rd: 15 points, 4th: 13 points, 5th: 11 points
  - 6th: 10 points, 7th: 9 points, 8th: 8 points, 9th: 7 points, 10th: 6 points
  - 11th: 5 points, 12th: 4 points, 13th: 3 points, 14th: 2 points, 15th: 1 point
  - 16th-20th: 1 point each

**Calculation Logic**:
- Points are calculated per participation
- Only started participations receive participation points
- Only finished participations with valid positions receive position points
- Total points = participation points + position points

### Data Model

**Participation Schema**:
- Core fields: participantId, raceId, registered, started, finished, position
- Position is nullable and only set for finished participations
- Unique constraint on (participantId, raceId) prevents duplicate participations
- All boolean flags default to false

## Consequences

### Positive

1. **Clear State Management**: Three-state system provides clear progression tracking
2. **Automatic Position Assignment**: Reduces manual work for race officials
3. **Flexible Position Adjustment**: Allows for corrections and protests
4. **Comprehensive Point System**: Rewards both participation and performance
5. **Data Integrity**: Constraints and validation prevent invalid states

### Negative

1. **Complex State Transitions**: Status cycling logic requires careful testing
2. **Position Reordering Overhead**: Manual adjustments trigger full reordering
3. **Point Calculation Coupling**: Points are calculated per participation, not aggregated
4. **No Historical Tracking**: Position changes don't preserve history

### Risks

1. **Race Conditions**: Concurrent position updates could cause inconsistencies
2. **Performance**: Large races with many participants may have reordering delays
3. **Data Loss**: Position changes are not reversible without manual intervention

## Alternatives Considered

1. **Four-State System**: registered → started → dnf → finished
   - Rejected: Added complexity without clear benefit

2. **Manual Position Assignment**: No automatic position assignment
   - Rejected: Would require more manual work for race officials

3. **Separate Point Tables**: Store calculated points in separate table
   - Rejected: Added complexity for minimal benefit

4. **Position History**: Track all position changes with timestamps
   - Rejected: Added complexity without clear use case

## References

- ADR 004: Participant Model Refactor 