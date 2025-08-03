"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface RaceResultImportSectionProps {
  seriesId: number
  participantsUrl?: string | null
}

export function RaceResultImportSection({ seriesId, participantsUrl }: RaceResultImportSectionProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [importResults, setImportResults] = useState<{
    contests: Array<{
      action: 'created' | 'updated';
      contest: {
        id: number;
        name: string;
      };
    }>;
    summary: {
      total: number;
      created: number;
      updated: number;
    };
  } | null>(null)
  const router = useRouter()

  const handleImport = async () => {
    if (!participantsUrl?.trim()) {
      toast.error("No RaceResult URL configured for this series")
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
          url: participantsUrl.trim()
        }),
      })

      if (!response.ok) {
        throw new Error(`Import failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setImportResults(result.data)
        toast.success(`Import completed! ${result.data.summary.created} contests created, ${result.data.summary.updated} updated.`)
        
        // Refresh the page to show new contests
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

  const isUrlValid = participantsUrl ? validateUrl(participantsUrl) : false

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Download className="h-5 w-5" />
          Import Contests from RaceResult
        </h2>
      </div>
      
      {!participantsUrl ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No RaceResult URL Configured</h3>
              <p className="text-gray-500 mb-4">
                To import contests from RaceResult, first configure a participants URL in the series settings.
              </p>
              <Button variant="outline" onClick={() => router.push(`/admin/series/${seriesId}/edit`)}>
                Configure Series
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label>Configured RaceResult URL</Label>
              <div className="p-3 bg-gray-50 rounded-md border">
                <div className="flex items-center justify-between">
                  <a
                    href={participantsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
                  >
                    {participantsUrl}
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/admin/series/${seriesId}/edit`)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
              {!isUrlValid && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  The configured URL doesn&apos;t appear to be a valid RaceResult data URL
                </p>
              )}
              <p className="text-sm text-gray-500">
                This URL will be used to import contests from RaceResult
              </p>
            </div>

            <Button 
              onClick={handleImport}
              disabled={isImporting || !isUrlValid}
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
                {importResults.contests.map((result, index: number) => (
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
              <p className="text-sm text-blue-700 mt-2">
                Fetching data from RaceResult and creating contests...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  )
} 