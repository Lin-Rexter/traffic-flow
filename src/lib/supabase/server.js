// Supabase CRUD
import { createServerClient, CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient(supabase_url=null, supabase_key=null) {
    const cookieStore = await cookies()

    return createServerClient(
        supabase_url ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabase_key ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}