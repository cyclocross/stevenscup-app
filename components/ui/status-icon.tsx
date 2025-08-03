import { CheckCircle, PlayCircle, UserCheck } from "lucide-react"

interface StatusIconProps {
  status: 'registered' | 'started' | 'finished'
  className?: string
}

export function StatusIcon({ status, className = "" }: StatusIconProps) {
  switch (status) {
    case 'registered':
      return <UserCheck className={`h-4 w-4 text-blue-500 ${className}`} />
    case 'started':
      return <PlayCircle className={`h-4 w-4 text-yellow-500 ${className}`} />
    case 'finished':
      return <CheckCircle className={`h-4 w-4 text-green-500 ${className}`} />
    default:
      return <UserCheck className={`h-4 w-4 text-gray-400 ${className}`} />
  }
} 