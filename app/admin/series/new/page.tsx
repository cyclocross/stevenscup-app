import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { SeriesForm } from "@/components/forms/series-form"

export default function NewSeriesPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Create New Series</h1>
      </div>

      <SeriesForm />
    </div>
  )
}
