import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ConnectClient } from "@/components/connect-client"

export default async function ConnectPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  return <ConnectClient user={user} />
}
