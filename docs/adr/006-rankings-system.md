# ADR 005: Public Rankings System

**Date:** 07.08.2025 15:00  
**Status:** Implemented  
**Deciders:** Development Team  

## Overview

The Public Rankings system provides a comprehensive view of cyclocross competition standings across all series and contests. It displays participant rankings based on accumulated points from race participations.

## Features

### Overview Page (`/rankings`)
- Shows all series with their contests
- Displays top 10 participants per contest
- Compact view with total points and basic participant info
- Links to detailed views

### Series Detail Page (`/rankings/series/[id]`)
- Shows all participants for each contest in a specific series
- Displays complete rankings for the series
- Links to individual contest details

### Contest Detail Page (`/rankings/contest/[id]`)
- Shows all participants in a specific contest
- Displays individual race results for each participant
- Shows point breakdown per race
- Complete ranking with detailed participation history

## Point Calculation

The ranking system uses a centralized point calculation function that awards points based on:

### Participation Points
- **Started Race**: 2 points for starting a race
- **Finished Race**: Points based on finishing position

### Position Points
Points are awarded for finishing positions using the following scale:
- 1st place: 20 points
- 2nd place: 17 points
- 3rd place: 15 points
- 4th place: 13 points
- 5th place: 11 points
- 6th place: 10 points
- 7th place: 9 points
- 8th place: 8 points
- 9th place: 7 points
- 10th place: 6 points
- 11th place: 5 points
- 12th place: 4 points
- 13th place: 3 points
- 14th place: 2 points
- 15th place: 1 point
- 16th-20th place: 1 point each

## Ranking Logic

### Primary Ranking
Participants are ranked by **total points** in descending order (higher points = better ranking).

### Tiebreaker
When participants have equal total points, the ranking is determined by:
1. **Last race position**: Better (lower) position in the most recent race wins
2. If no last race position, participants are ranked equally

## Technical Implementation

### Core Functions

#### `calculatePointsForParticipation()`
Central function that calculates points for a single race participation based on:
- Whether the participant started the race
- Whether the participant finished the race
- Final position (if finished)

#### `getContestRankings()`
Calculates rankings for all participants in a contest:
- Fetches all participants in the contest
- Gets all race participations for each participant
- Calculates total points and last race position
- Sorts by total points, then by last race position

#### `getAllSeriesRankings()`
Provides overview data for all series:
- Fetches all series with their contests
- Gets top 10 participants per contest
- Returns structured data for the overview page

### Data Structure

```typescript
type ParticipantRanking = {
  participantId: number
  participantName: string
  participantClub: string | null
  participantBibNumber: number
  totalPoints: number
  lastRacePosition: number | null
  participations: {
    raceId: number
    eventName: string
    eventDate: string
    position: number | null
    points: number
  }[]
}
```

## UI Features

### Visual Indicators
- **Medals**: Gold, silver, and bronze medals for top 3 positions
- **Position numbers**: Clear ranking indicators
- **Point totals**: Prominent display of accumulated points
- **Race results**: Detailed breakdown of individual race performances

### Navigation
- Breadcrumb navigation back to rankings overview
- Direct links between series and contest views
- Responsive design for mobile and desktop

### Empty States
- Helpful messages when no data is available
- Clear indication of when rankings will appear

## Performance Considerations

- Rankings are calculated on-demand using server actions
- Efficient database queries with proper joins
- Caching through Next.js revalidation
- Optimized for real-time updates as race results change

## Future Enhancements

Potential improvements could include:
- Historical rankings and trends
- Season-to-season comparisons
- Export functionality for rankings
- Real-time updates during live races
- Advanced filtering and search options 