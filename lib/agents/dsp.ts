
// @ts-ignore
import fft from 'fft-js'

interface DSPResult {
    pitch: number
    volume: number
    speaking_pace: number
    stress_index: number
    repetition_count: number
}

// Helper to decode Base64 to Float32Array
function decodeAudio(base64Audio: string): Float32Array {
    try {
        const binaryString = atob(base64Audio)
        const len = binaryString.length
        // Assume PCM16 input
        // Length must be even for Int16
        const adjustedLen = len % 2 === 0 ? len : len - 1
        const buffer = new Int16Array(adjustedLen / 2)

        for (let i = 0; i < adjustedLen; i += 2) {
            // Little-endian
            const low = binaryString.charCodeAt(i)
            const high = binaryString.charCodeAt(i + 1)
            const sample = (high << 8) | low
            // Convert to Signed 16-bit
            const int16Sample = sample >= 32768 ? sample - 65536 : sample
            buffer[i / 2] = int16Sample
        }

        // Convert to Float32 [-1.0, 1.0]
        const float32 = new Float32Array(buffer.length)
        for (let i = 0; i < buffer.length; i++) {
            float32[i] = buffer[i] / 32768.0
        }

        return float32
    } catch (e) {
        console.error("DSP Decode Error", e)
        return new Float32Array(512) // Return silence on fail
    }
}

function computeRMS(audio: Float32Array): number {
    if (audio.length === 0) return 0
    let sumSquares = 0
    for (const sample of audio) {
        sumSquares += sample * sample
    }
    return Math.sqrt(sumSquares / audio.length)
}

function computePitch(audio: Float32Array, sampleRate: number): number {
    // Basic autocorrelation method or FFT Peak logic
    // For short real-time frames, autocorrelation is often more stable for pitch
    // If we use FFT-JS:
    try {
        // FFT-js requires power of 2 length usually
        // Pad to next power of two
        let n = 1
        while (n < audio.length) n *= 2

        const padded = new Array(n).fill(0)
        for (let i = 0; i < audio.length; i++) padded[i] = audio[i]

        const phasors = fft.fft(padded)
        const frequencies = fft.util.fftFreq(phasors, sampleRate)
        const magnitudes = fft.util.fftMag(phasors)

        // Find peak frequency (ignoring DC)
        let maxMag = 0
        let peakFreq = 0
        // Search usually between 85Hz and 255Hz (human speech fundamentals approx)
        for (let i = 0; i < frequencies.length; i++) {
            const freq = frequencies[i]
            if (freq > 85 && freq < 400) {
                if (magnitudes[i] > maxMag) {
                    maxMag = magnitudes[i]
                    peakFreq = freq
                }
            }
        }
        return peakFreq
    } catch (e) {
        return 0
    }
}

export function extractDSPFeatures(input: string | number[], sampleRate = 16000): DSPResult {
    let audio: Float32Array

    // Handle input type: Raw Float Array vs Base64 PCM16
    if (Array.isArray(input)) {
        audio = new Float32Array(input)
    } else {
        audio = decodeAudio(input)
    }

    // 1. Volume
    const rms = computeRMS(audio)
    const volume = Math.min(rms / 0.1, 1.0)

    // 2. Pitch
    const pitch = computePitch(audio, sampleRate)

    // 3. Pace (Activity Proxy)
    // Count samples > threshold
    let activeSamples = 0
    for (const s of audio) {
        if (Math.abs(s) > 0.05) activeSamples++
    }
    const pace = Math.round((activeSamples / Math.max(audio.length, 1)) * 160 * 60)

    // 4. Stress Index
    // Variance
    let mean = 0
    for (const s of audio) mean += s
    mean /= audio.length

    let variance = 0
    for (const s of audio) variance += (s - mean) ** 2
    variance /= audio.length

    const stress = Math.min(
        0.5 * variance +
        0.5 * Math.abs(pitch - 150.0) / 150.0,
        1.0
    )

    return {
        pitch: Math.round(pitch * 100) / 100,
        volume: Math.round(volume * 1000) / 1000,
        speaking_pace: pace,
        stress_index: Math.round(stress * 1000) / 1000,
        repetition_count: 0
    }
}
