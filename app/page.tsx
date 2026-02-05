"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // This sends the user straight to the login page as soon as they open the site
    router.push("/auth/login")
  }, [router])

  return null // Returns nothing because the user is redirected immediately
}
