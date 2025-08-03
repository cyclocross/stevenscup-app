#!/usr/bin/env node

/**
 * Simple test script to verify rankings functionality
 * Run with: node scripts/test-rankings.js
 */

async function runTests() {
  console.log('🧪 Testing Rankings System...\n')

  // Test point calculation function (copied from rankings.ts)
  async function calculatePointsForParticipation(participation) {
    let points = 0

    // Base points for participation
    if (participation.started) points += 2

    // Position points for finished participations
    const pointsForPosition = [20, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1, 1, 1, 1, 1]

    if (participation.finished && participation.position) {
      if (participation.position >= 1 && participation.position <= pointsForPosition.length) {
        points += pointsForPosition[participation.position - 1]
      }
    }

    return points
  }

  console.log('📊 Testing Point Calculation:')

  const testCases = [
    {
      name: '1st place finish',
      participation: { registered: true, started: true, finished: true, position: 1 },
      expected: 22 // 2 for started + 20 for 1st place
    },
    {
      name: '2nd place finish',
      participation: { registered: true, started: true, finished: true, position: 2 },
      expected: 19 // 2 for started + 17 for 2nd place
    },
    {
      name: '10th place finish',
      participation: { registered: true, started: true, finished: true, position: 10 },
      expected: 8 // 2 for started + 6 for 10th place
    },
    {
      name: 'Started but not finished',
      participation: { registered: true, started: true, finished: false, position: null },
      expected: 2 // 2 for started only
    },
    {
      name: 'Registered but not started',
      participation: { registered: true, started: false, finished: false, position: null },
      expected: 0 // No points
    },
    {
      name: '20th place finish',
      participation: { registered: true, started: true, finished: true, position: 20 },
      expected: 3 // 2 for started + 1 for 20th place
    },
    {
      name: 'Position beyond 20',
      participation: { registered: true, started: true, finished: true, position: 25 },
      expected: 2 // 2 for started only (no position points beyond 20)
    }
  ]

  let allTestsPassed = true

  for (let index = 0; index < testCases.length; index++) {
    const testCase = testCases[index]
    const result = await calculatePointsForParticipation(testCase.participation)
    const passed = result === testCase.expected
    
    console.log(`${passed ? '✅' : '❌'} Test ${index + 1}: ${testCase.name}`)
    console.log(`   Expected: ${testCase.expected}, Got: ${result}`)
    
    if (!passed) {
      allTestsPassed = false
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(allTestsPassed ? '🎉 All tests passed!' : '💥 Some tests failed!')
  console.log('='.repeat(50))

  // Test ranking logic
  console.log('\n📈 Testing Ranking Logic:')

  const mockParticipants = [
    { name: 'Alice', totalPoints: 50, lastRacePosition: 2 },
    { name: 'Bob', totalPoints: 50, lastRacePosition: 1 },
    { name: 'Charlie', totalPoints: 45, lastRacePosition: 3 },
    { name: 'David', totalPoints: 50, lastRacePosition: null },
    { name: 'Eve', totalPoints: 40, lastRacePosition: 5 }
  ]

  // Sort by total points (desc), then by last race position (asc)
  const sortedParticipants = mockParticipants.sort((a, b) => {
    if (a.totalPoints !== b.totalPoints) {
      return b.totalPoints - a.totalPoints
    }
    
    // For equal points, better last race position (lower number) wins
    if (a.lastRacePosition === null && b.lastRacePosition === null) return 0
    if (a.lastRacePosition === null) return 1
    if (b.lastRacePosition === null) return -1
    return a.lastRacePosition - b.lastRacePosition
  })

  console.log('Expected ranking order:')
  console.log('1. Bob (50 points, last position: 1)')
  console.log('2. Alice (50 points, last position: 2)')
  console.log('3. David (50 points, no last position)')
  console.log('4. Charlie (45 points, last position: 3)')
  console.log('5. Eve (40 points, last position: 5)')

  console.log('\nActual ranking order:')
  sortedParticipants.forEach((participant, index) => {
    console.log(`${index + 1}. ${participant.name} (${participant.totalPoints} points, last position: ${participant.lastRacePosition || 'none'})`)
  })

  console.log('\n✅ Ranking logic test completed!')
}

runTests().catch(console.error) 