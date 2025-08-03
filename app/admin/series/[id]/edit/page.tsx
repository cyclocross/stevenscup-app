import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { getSeriesById } from "@/lib/actions/series"
import { SeriesForm } from "@/components/forms/series-form"

interface EditSeriesPageProps {
  params: Promise<{ id: string }>
}

export default async function EditSeriesPage({ params }: EditSeriesPageProps) {
  const { id } = await params
  const seriesId = parseInt(id)
  
  const series = await getSeriesById(seriesId)
  
  if (!series) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Series Not Found</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              The series you&apos;re looking for doesn&apos;t exist.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Series</h1>
          <p className="text-gray-600">Update series details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit {series.name}</CardTitle>
          <CardDescription>
            Update the series information below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SeriesForm 
            mode="edit" 
            initialData={series}
            seriesId={seriesId}
          />
        </CardContent>
      </Card>
    </div>
  )
} 