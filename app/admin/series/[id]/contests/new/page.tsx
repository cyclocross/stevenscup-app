import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ContestForm } from "@/components/forms/contest-form"
import { getSeriesById } from "@/lib/actions/series"
import { notFound } from "next/navigation"

export default async function NewContestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const seriesId = Number.parseInt(id)
  const series = await getSeriesById(seriesId)

  if (!series) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/series/${seriesId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add Contest</h1>
          <p className="text-gray-600">{series.name}</p>
        </div>
      </div>

      <ContestForm mode="create" seriesId={seriesId} />
    </div>
  )
}
