/**
 * Creates a specific Admin account via Supabase Admin API.
 * Run with: npx tsx scripts/create-admin.ts
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
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Missing env vars. Check .env.local.')
    process.exit(1)
}

// Admin client — bypasses RLS
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
})

const ADMIN_ACCOUNT = {
    email: 'cuonglhv@jaxtina.com',
    password: 'jaxtina2026',
    role: 'admin',
    fullName: 'Cuong LHV (Head Teacher)',
}

async function createAdmin() {
    console.log('\nCreating Admin: ' + ADMIN_ACCOUNT.email)

    // 1. Check if user already exists
    const { data: existing } = await supabase.auth.admin.listUsers()
    const alreadyExists = existing?.users?.find((u) => u.email === ADMIN_ACCOUNT.email)

    let userId: string

    if (alreadyExists) {
        console.log('  User already exists — updating password & role')
        const { error } = await supabase.auth.admin.updateUserById(alreadyExists.id, {
            password: ADMIN_ACCOUNT.password,
            email_confirm: true,
            user_metadata: { role: ADMIN_ACCOUNT.role },
        })
        if (error) { console.error('  Update failed:', error.message); return }
        userId = alreadyExists.id
    } else {
        // 2. Create auth user
        const { data, error } = await supabase.auth.admin.createUser({
            email: ADMIN_ACCOUNT.email,
            password: ADMIN_ACCOUNT.password,
            email_confirm: true,
            user_metadata: { role: ADMIN_ACCOUNT.role },
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
            user_id: userId,
            role: ADMIN_ACCOUNT.role,
            full_name: ADMIN_ACCOUNT.fullName,
        }, { onConflict: 'user_id' })

    if (profileError) {
        console.error('  Profile upsert failed:', profileError.message)
        return
    }

    console.log('  Profile set to ADMIN.')
    console.log('  Login: ' + ADMIN_ACCOUNT.email + ' / ' + ADMIN_ACCOUNT.password)
}

createAdmin().catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
})