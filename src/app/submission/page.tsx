import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import SubmissionForm from './SubmissionForm'

export default async function SubmissionPage() {
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('user_id', user.id)
        .single()

    if (!profile?.full_name) redirect('/onboarding')
    if (profile.role !== 'student') redirect('/teacher')

    return (
        <>
            <Navbar role={profile.role} fullName={profile.full_name} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <SubmissionForm />
            </main>
        </>
    )
}
