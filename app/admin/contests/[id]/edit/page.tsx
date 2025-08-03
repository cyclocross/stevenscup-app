import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { getContestById } from "@/lib/actions/contests"
import { ContestForm } from "@/components/forms/contest-form"

interface EditContestPageProps {
  params: Promise<{ id: string }>
}

export default async function EditContestPage({ params }: EditContestPageProps) {
  const { id } = await params
  const contestId = parseInt(id)
  
  const contest = await getContestById(contestId)
  
  if (!contest) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Contest Not Found</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              The contest you&apos;re looking for doesn&apos;t exist.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/series/${contest.seriesId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Contest</h1>
          <p className="text-gray-600">Update contest details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit {contest.name}</CardTitle>
          <CardDescription>
            Update the contest information below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContestForm 
            mode="edit" 
            initialData={contest}
            contestId={contestId}
            seriesId={contest.seriesId}
          />
        </CardContent>
      </Card>
    </div>
  )
} 