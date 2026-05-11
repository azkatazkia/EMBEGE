'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [household, setHousehold] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function initialize() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setUser(user)

      const { data: member, error } = await supabase
        .from('household_members')
        .select('household_id, households(id, name, invite_code)')
        .eq('user_id', user.id)
        .single()

      console.log('member:', member)
      console.log('error:', error)

      if (!member) return router.push('/household')
      setHousehold(member.households)
    }
    initialize()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user || !household) return <p>Loading...</p>

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{household.name}</h1>
        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
      <p className="mt-2 text-gray-500">Logged in as {user.email}</p>
      <div className="mt-6 p-4 bg-gray-100 rounded inline-block">
        <p className="text-sm text-gray-500">Your invite code</p>
        <p className="text-2xl font-bold tracking-widest">{household.invite_code}</p>
        <p className="text-xs text-gray-400 mt-1">Share this with your housemates</p>
      </div>
    </div>
  )
}