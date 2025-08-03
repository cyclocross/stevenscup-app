import { NextRequest, NextResponse } from 'next/server'
import { upsertContestsFromRaceResult } from '@/lib/actions/contests'

export async function POST(request: NextRequest) {
  try {
    const { seriesId, url } = await request.json()

    if (!seriesId || !url) {
      return NextResponse.json(
        { success: false, error: 'Missing seriesId or url' },
        { status: 400 }
      )
    }

    // Fetch data from RaceResult URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch RaceResult data: ${response.status} ${response.statusText}`)
    }

    const jsonData = await response.json()

    // Extract contests from the RaceResult data
    const contests: Array<{
      name: string
      category: string
      ageRange: string
      participantCount: number
      externalId: string
    }> = []
    if (jsonData.data) {
      Object.entries(jsonData.data).forEach(([contestKey, contestData]) => {
        // Parse contest key to extract information
        const parts = contestKey.split('_')
        const id = parts[0].replace('#', '')
        
        if (parts.length >= 2) {
          const contestInfo = parts[1]
          
          // Extract category and age range
          const categoryMatch = contestInfo.match(/^([^0-9]+)/)
          const ageMatch = contestInfo.match(/(\d{4})\s*-\s*(\d{4})/)
          
          const category = categoryMatch ? categoryMatch[1].trim() : 'Unknown'
          const ageRange = ageMatch ? `${ageMatch[1]}-${ageMatch[2]}` : 'Unknown'
          
          // Count participants (remove the count at the end)
          const participants = Array.isArray(contestData) ? contestData.slice(0, -1) : []
          
          contests.push({
            name: contestInfo,
            category: category,
            ageRange: ageRange,
            participantCount: participants.length,
            externalId: id
          })
        }
      })
    }

    if (contests.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No contests found in RaceResult data' },
        { status: 400 }
      )
    }

    // Clean contest names (trim multiple whitespaces)
    const cleanedContests = contests.map(contest => ({
      ...contest,
      name: contest.name.replace(/\s+/g, ' ').trim(),
      category: contest.category.replace(/\s+/g, ' ').trim()
    }))

    // Upsert contests in the database
    const result = await upsertContestsFromRaceResult(seriesId, cleanedContests)

    if (!result.success) {
      throw new Error(result.error || 'Failed to upsert contests')
    }

    return NextResponse.json({
      success: true,
      data: {
        contests: result.results,
        summary: result.summary
      }
    })

  } catch (error) {
    console.error('RaceResult import error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Import failed' 
      },
      { status: 500 }
    )
  }
} 