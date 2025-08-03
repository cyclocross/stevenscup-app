"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface RaceResultImportProps {
  seriesId: number
}

interface ContestImportResult {
  action: 'created' | 'updated'
  contest: {
    id: number
    name: string
    // category: string
    // ageRange: string
    // participantCount: number
  }
}

interface ImportSummary {
  total: number
  created: number
  updated: number
}

export function RaceResultImport({ seriesId }: RaceResultImportProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [importUrl, setImportUrl] = useState("")
  const [importResults, setImportResults] = useState<{
    contests: ContestImportResult[]
    summary: ImportSummary
  } | null>(null)

  const router = useRouter()

  const handleImport = async () => {
    if (!importUrl.trim()) {
      toast.error("Please enter a RaceResult URL")
      return
    }

    setIsImporting(true)
    setImportResults(null)

    try {
      // Call the import API
      const response = await fetch('/api/import/raceresult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seriesId,
          url: importUrl.trim()
        }),
      })

      if (!response.ok) {
        throw new Error(`Import failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setImportResults(result.data)
        toast.success(`Import completed! ${result.data.summary.created} contests created, ${result.data.summary.updated} updated.`)
        
        // Clear the URL after successful import
        setImportUrl("")
        
        // Notify parent component
        router.refresh()
      } else {
        throw new Error(result.error || "Import failed")
      }
    } catch (error) {
      console.error("Import error:", error)
      toast.error(error instanceof Error ? error.message : "Import failed")
    } finally {
      setIsImporting(false)
    }
  }

  const validateUrl = (url: string) => {
    return url.includes('raceresult.com') && url.includes('/RRPublish/data/list')
  }

  const isUrlValid = validateUrl(importUrl)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Import Contests from RaceResult
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="raceresult-url">RaceResult Data URL</Label>
          <Input
            id="raceresult-url"
            type="url"
            placeholder="https://my4.raceresult.com/.../RRPublish/data/list?..."
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            disabled={isImporting}
          />
          {importUrl && !isUrlValid && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Please enter a valid RaceResult data URL
            </p>
          )}
          <p className="text-sm text-gray-500">
            Enter the direct data URL from RaceResult (ends with /RRPublish/data/list)
          </p>
        </div>

        <Button 
          onClick={handleImport}
          disabled={isImporting || !isUrlValid || !importUrl.trim()}
          className="w-full"
        >
          {isImporting ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Importing Contests...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Import Contests
            </>
          )}
        </Button>

        {/* Import Results */}
        {importResults && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Import Results
            </h4>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{importResults.summary.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{importResults.summary.created}</div>
                <div className="text-sm text-gray-600">Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{importResults.summary.updated}</div>
                <div className="text-sm text-gray-600">Updated</div>
              </div>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {importResults.contests.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex-1">
                    <div className="font-medium">{result.contest.name}</div>
                    <div className="text-sm text-gray-600">
                      {/* {result.contest.category} • {result.contest.ageRange} • {result.contest.participantCount} participants */}
                    </div>
                  </div>
                  <Badge variant={result.action === 'created' ? 'default' : 'secondary'}>
                    {result.action === 'created' ? 'Created' : 'Updated'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Import Status Indicator */}
        {isImporting && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <Clock className="h-5 w-5 animate-spin" />
              <span className="font-medium">Import in Progress...</span>
            </div>
            <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
            <p className="text-sm text-blue-600 mt-2">
              Fetching data from RaceResult and creating contests...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 