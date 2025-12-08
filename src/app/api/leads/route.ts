import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

export async function POST(request: NextRequest) {
    try {
        // Get API key from header
        const apiKey = request.headers.get('x-api-key')

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Missing API key. Include x-api-key header.' },
                { status: 401 }
            )
        }

        // Validate API key and get user
        const supabaseAdmin = getAdminClient()
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id, email, company_name')
            .eq('api_key', apiKey)
            .single()

        if (profileError || !profile) {
            return NextResponse.json(
                { error: 'Invalid API key' },
                { status: 401 }
            )
        }

        // Parse request body
        const body = await request.json()

        // Validate required fields
        if (!body.name) {
            return NextResponse.json(
                { error: 'Missing required field: name' },
                { status: 400 }
            )
        }

        // Create lead
        const lead = {
            user_id: profile.id,
            name: body.name,
            email: body.email || null,
            phone: body.phone || null,
            company: body.company || null,
            value: parseFloat(body.value) || 0,
            status: body.status || 'new',
            source: body.source || 'API',
            notes: body.notes || null,
        }

        const { data: newLead, error: insertError } = await supabaseAdmin
            .from('leads')
            .insert(lead)
            .select()
            .single()

        if (insertError) {
            console.error('Error creating lead:', insertError)
            return NextResponse.json(
                { error: 'Failed to create lead', details: insertError.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Lead created successfully',
            lead: newLead
        }, { status: 201 })

    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// GET endpoint to check API status
export async function GET(request: NextRequest) {
    const apiKey = request.headers.get('x-api-key')

    if (!apiKey) {
        return NextResponse.json({
            status: 'Koolgrowth CRM API',
            version: '1.0',
            message: 'Include x-api-key header to authenticate'
        })
    }

    // Validate API key
    const supabaseAdmin = getAdminClient()
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('email, company_name')
        .eq('api_key', apiKey)
        .single()

    if (!profile) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    return NextResponse.json({
        status: 'authenticated',
        account: profile.email,
        company: profile.company_name
    })
}
