import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'

interface StudentProfile {
    full_name: string | null
    age: number | null
    background: string | null
    created_at: string
}

export default async function AdminPage() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/dashboard')
    }

    // Fetch stats
    const { count: studentCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')

    const { count: teacherCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'teacher')

    const { data: submissions } = await supabase
        .from('submissions')
        .select('overall_band')
        .not('overall_band', 'is', null)

    const totalPractices = submissions?.length || 0
    const avgScore = totalPractices > 0
        ? (submissions!.reduce((acc: number, curr: any) => acc + (curr.overall_band || 0), 0) / totalPractices).toFixed(2)
        : 'N/A'

    const { data: students } = await supabase
        .from('profiles')
        .select('full_name, age, background, created_at')
        .eq('role', 'student')

    const demographics = {
        under18: 0,
        range18to24: 0,
        range25to34: 0,
        plus35: 0,
        unknown: 0
    };
    (students as StudentProfile[] | null)?.forEach((s: StudentProfile) => {
        if (!s.age) demographics.unknown++
        else if (s.age < 18) demographics.under18++
        else if (s.age <= 24) demographics.range18to24++
        else if (s.age <= 34) demographics.range25to34++
        else demographics.plus35++
    })

    const stats = {
        studentCount: studentCount || 0,
        teacherCount: teacherCount || 0,
        totalPractices,
        avgScore,
        demographics
    }

    // Prepare export data
    const exportData = (students as StudentProfile[] | null)?.map((s: StudentProfile) => ({
        FullName: s.full_name,
        Age: s.age,
        Background: s.background,
        Joined: new Date(s.created_at).toLocaleDateString()
    })) || []

    return (
        <main className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Head Teacher Dashboard</h1>
            <AdminDashboard stats={stats} exportData={exportData} />
        </main>
    )
}
