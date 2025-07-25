import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Settings } from "lucide-react"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="text-center mb-8">
        <Trophy className="mx-auto h-16 w-16 text-orange-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cyclocross Rankings</h1>
        <p className="text-gray-600">Manage competition series and track cyclist performance</p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Administration
            </CardTitle>
            <CardDescription>Manage series, events, and contests</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin">
              <Button className="w-full" size="lg">
                Admin Panel
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Public Rankings
            </CardTitle>
            <CardDescription>View current standings and results</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/rankings">
              <Button variant="outline" className="w-full bg-transparent" size="lg">
                View Rankings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
