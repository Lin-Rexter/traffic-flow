import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request) {
    //return <pre>{JSON.stringify(notes, null, 2)}</pre>
    return NextResponse.json({ notes })
}