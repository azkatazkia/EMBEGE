'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function HouseholdPage() {
  const [user, setUser] = useState(null)
  const [householdName, setHouseholdName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
    }
    getUser()
  }, [])

  async function handleCreate() {
    setError(null)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { data: household, error: createError } = await supabase
      .from('households')
      .insert({ name: householdName, invite_code: code })
      .select()
      .single()

    if (createError) return setError(createError.message)

    const { error: memberError } = await supabase
      .from('household_members')
      .insert({ household_id: household.id, user_id: user.id })

    if (memberError) return setError(memberError.message)

    router.push('/dashboard')
  }

  async function handleJoin() {
    setError(null)

    const { data: household, error: findError } = await supabase
      .from('households')
      .select()
      .eq('invite_code', inviteCode.toUpperCase())
      .single()

    if (findError || !household) return setError('Invalid invite code')

    const { error: memberError } = await supabase
      .from('household_members')
      .insert({ household_id: household.id, user_id: user.id })

    if (memberError) return setError(memberError.message)

    router.push('/dashboard')
  }

  if (!user) return <p>Loading...</p>

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col gap-8 w-80">
        <h1 className="text-2xl font-bold">Set Up Your Household</h1>

        <div className="flex flex-col gap-3">
          <h2 className="font-semibold">Create a new household</h2>
          <input
            className="border p-2 rounded"
            placeholder="Household name"
            value={householdName}
            onChange={e => setHouseholdName(e.target.value)}
          />
          <button
            className="bg-black text-white p-2 rounded"
            onClick={handleCreate}
          >
            Create
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-semibold">Join an existing household</h2>
          <input
            className="border p-2 rounded"
            placeholder="Invite code"
            value={inviteCode}
            onChange={e => setInviteCode(e.target.value)}
          />
          <button
            className="bg-black text-white p-2 rounded"
            onClick={handleJoin}
          >
            Join
          </button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  )
}