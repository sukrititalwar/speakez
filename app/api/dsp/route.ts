import { NextRequest, NextResponse } from 'next/server'
import { extractDSPFeatures } from '@/lib/agents/dsp'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { audio_frame, audio_data, sample_rate } = body

        if (!audio_frame && !audio_data) {
            return NextResponse.json({ error: "Missing audio_frame or audio_data" }, { status: 400 })
        }

        const start = performance.now()
        // Prioritize audio_data (raw) if available, else audio_frame (base64)
        const features = extractDSPFeatures(audio_data || audio_frame, sample_rate || 16000)
        const end = performance.now()

        return NextResponse.json(features)
    } catch (error: any) {
        console.error("DSP Error", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
