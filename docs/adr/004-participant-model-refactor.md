# ADR 004: Participant Model Refactor

**Date:** 05.08.2025 10:30  
**Status:** Implemented  
**Deciders:** Development Team  

## Context

The original data model included separate `Cyclist` and `CyclistContest` entities to represent cyclists and their participation in contests. However, this design had several issues:

1. **No Account System**: Cyclists don't log in or have accounts, making the `Cyclist` entity unnecessary
2. **Contest-Specific Participation**: Cyclists could theoretically move between contests when their license expires or their gender changes
3. **Bib Number Scope**: Bib numbers are unique per contest, not globally unique
4. **Simplified Data Model**: The two-entity approach was unnecessarily complex

## Decision

Refactor the data model to use a single `Participant` entity that directly represents a person participating in a specific contest. This eliminates the need for the `Cyclist` entity and simplifies the data model.

### New Data Model

**Series**
- id, name, begin, end, description
- events[] (one-to-many)
- contests[] (one-to-many)

**Contest**
- id, series_id, name, duration
- Attributes participant criteria: birth_year_from, birth_year_to, gender
- participants[] (one-to-many)

**Participant**
- id, contest_id, name, birth_year, gender, club, team, license_number
- bib_number (unique per contest)
- participations[] (one-to-many)

**Event**
- id, series_id, date, location, club
- races[] (one-to-many)

**Race**
- id, event_id, contest_id, start_time
- participations[] (one-to-many)

**Participation**
- id, participant_id, race_id
- Unique constraint: (participant_id, race_id)
- registered, started, finished, position (optional)
- is_provisional, created_at, updated_at

## Implementation

### Database Schema Changes

1. **Removed Tables:**
   - `cyclists` table
   - `cyclist_contests` table

2. **Added Tables:**
   - `participants` table with contest-specific fields
   - `participations` table for race participation tracking

3. **Updated Tables:**
   - `contests` table: Added `duration`, `birth_year_from`, `birth_year_to` fields
   - `races` table: Removed `duration` field (moved to contests)

### Code Changes

1. **Actions:**
   - Created `lib/actions/participants.ts` for participant CRUD operations
   - Created `lib/actions/participations.ts` for participation management
   - Updated `lib/actions/contests.ts` to use participants instead of cyclistContests

2. **Forms:**
   - Created `components/forms/participant-form.tsx` for participant management
   - Created `components/forms/participation-form.tsx` for participation management
   - Updated `components/forms/contest-form.tsx` to include participant criteria fields

3. **UI Components:**
   - Added `components/ui/checkbox.tsx` for form checkboxes

### Migration

Recreated the database without adding new migration file. Now `drizzle` is added to repository. In the future all migrations will be added to drizzle and executed properly.

## References

- Original data model in ADR 001
- New data model requirements from user specifications 