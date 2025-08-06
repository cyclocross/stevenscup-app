import { redirect } from "next/navigation"

export default async function ContestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/contests/${id}/participants`)
} 