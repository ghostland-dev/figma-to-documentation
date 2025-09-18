import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"
import Link from "next/link"

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Check Your Email</CardTitle>
          <CardDescription>We've sent you a confirmation link to complete your registration.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-6">
            Click the link in your email to verify your account and start using Figma Documentation.
          </p>
          <Link href="/auth/login" className="text-amber-600 hover:text-amber-700 font-medium text-sm">
            Back to Sign In
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
