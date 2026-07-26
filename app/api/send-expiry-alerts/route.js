import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const today = new Date().toISOString().split('T')[0]
    const fiveDaysFromNow = new Date()
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5)
    const cutoff = fiveDaysFromNow.toISOString().split('T')[0]

    const { data: expiringItems, error: itemsError } = await supabase
      .from('food_items')
      .select('name, expiry_date, household_id')
      .lte('expiry_date', cutoff)
      .gte('expiry_date', today)

    if (itemsError) throw itemsError
    if (!expiringItems?.length) return Response.json({ sent: 0 })

    const byHousehold = expiringItems.reduce((acc, item) => {
      acc[item.household_id] = acc[item.household_id] || []
      acc[item.household_id].push(item)
      return acc
    }, {})

    let emailsSent = 0

    for (const [householdId, items] of Object.entries(byHousehold)) {
      const { data: members, error: membersError } = await supabase
        .from('household_members')
        .select('user_id')
        .eq('household_id', householdId)

      if (membersError || !members?.length) continue

      for (const member of members) {
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(member.user_id)
        if (userError || !userData?.user?.email) continue

        const email = userData.user.email

        const itemList = items
          .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date))
          .map(i => `• ${i.name} — expires ${i.expiry_date}`)
          .join('\n')

        const { error: sendError } = await resend.emails.send({
          from: 'Embege <onboarding@resend.dev>',
          to: email,
          subject: `${items.length} item${items.length > 1 ? 's' : ''} expiring soon in your household`,
          text: `Hi!\n\nThese items are expiring within 5 days:\n\n${itemList}\n\nOpen Embege to use them up before they go to waste.`,
        })

        if (!sendError) emailsSent++
      }
    }

    return Response.json({ sent: emailsSent })
  } catch (err) {
    console.error('[send-expiry-alerts]', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}