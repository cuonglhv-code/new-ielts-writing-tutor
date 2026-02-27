/**
 * Creates two test accounts (student + teacher) via Supabase Admin API.
 * This bypasses email confirmation so accounts are immediately usable.
 *
 * Run with:  npm run create-test-accounts
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Load env vars
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const eqIdx = line.indexOf('=')
    if (eqIdx < 1) continue
    const key = line.slice(0, eqIdx).trim()
    const val = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (key && val) process.env[key] = val
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env vars. Check .env.local.')
  process.exit(1)
}

// Admin client — bypasses RLS and email confirmation
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const TEST_ACCOUNTS = [
  {
    email:    'student@test.com',
    password: 'Test1234!',
    role:     'student',
    fullName: 'Test Student',
    bandTarget: 7,
    studyHours: 2,
    age: 22,
    background: 'Preparing for university admission',
  },
  {
    email:    'teacher@test.com',
    password: 'Test1234!',
    role:     'teacher',
    fullName: 'Test Teacher',
    bandTarget: null,
    studyHours: null,
    age: null,
    background: null,
  },
]

async function createAccount(account: typeof TEST_ACCOUNTS[0]) {
  console.log('\nCreating: ' + account.email + ' (' + account.role + ')')

  // 1. Check if user already exists
  const { data: existing } = await supabase.auth.admin.listUsers()
  const alreadyExists = existing?.users?.find((u) => u.email === account.email)

  let userId: string

  if (alreadyExists) {
    console.log('  User already exists — updating password')
    const { error } = await supabase.auth.admin.updateUserById(alreadyExists.id, {
      password: account.password,
      email_confirm: true,
      user_metadata: { role: account.role },
    })
    if (error) { console.error('  Update failed:', error.message); return }
    userId = alreadyExists.id
  } else {
    // 2. Create auth user with email already confirmed
    const { data, error } = await supabase.auth.admin.createUser({
      email:            account.email,
      password:         account.password,
      email_confirm:    true,          // skip email confirmation
      user_metadata:    { role: account.role },
    })

    if (error || !data.user) {
      console.error('  Auth creation failed:', error?.message)
      return
    }
    userId = data.user.id
    console.log('  Auth user created: ' + userId)
  }

  // 3. Upsert profile
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      user_id:     userId,
      role:        account.role,
      full_name:   account.fullName,
      age:         account.age,
      band_target: account.bandTarget,
      study_hours: account.studyHours,
      background:  account.background,
    }, { onConflict: 'user_id' })

  if (profileError) {
    console.error('  Profile upsert failed:', profileError.message)
    return
  }

  console.log('  Profile set: ' + account.fullName)
  console.log('  Login: ' + account.email + ' / ' + account.password)
}

async function main() {
  console.log('\nCreating test accounts...')
  for (const account of TEST_ACCOUNTS) {
    await createAccount(account)
  }

  console.log('\n\nTest accounts ready:')
  console.log('  Student  ->  student@test.com  /  Test1234!')
  console.log('  Teacher  ->  teacher@test.com  /  Test1234!')
  console.log('')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
