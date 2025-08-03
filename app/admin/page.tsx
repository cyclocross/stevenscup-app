import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Users, Plus } from "lucide-react"
import { getAllSeries } from "@/lib/actions/series"
import { SeriesActions } from "@/components/series-actions"

export default async function AdminPage() {
  const allSeries = await getAllSeries()

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>

      <div className="space-y-4 mb-6">
        <Link href="/admin/series/new">
          <Button className="w-full" size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Create New Series
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Existing Series</h2>

        {allSeries.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">
                No series created yet. Create your first series to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          allSeries.map((series) => (
            <Card key={series.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{series.name}</span>
                  <span className="text-sm font-normal text-gray-500">{series.season}</span>
                </CardTitle>
                <CardDescription>{series.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {series.events?.length || 0} events
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {series.contests?.length || 0} contests
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/series/${series.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      Manage Series
                    </Button>
                  </Link>
                  <SeriesActions series={series} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
