'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { OrchestratorAgent } from '@/lib/agents/orchestrator'
import {
  Mic,
  Video,
  VideoOff,
  Play,
  Pause,
  Square,
  MessageSquare,
  Target,
  Clock,
  Briefcase,
  Users,
  Phone,
  Utensils,
  Lightbulb,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import LiveSignalBar from '@/components/LiveSignalBar'
import LiveObservationFeed from '@/components/LiveObservationFeed'
import SpeechPatternAwareness from '@/components/SpeechPatternAwareness'
import ScenarioEventCard from '@/components/ScenarioEventCard'
import {
  generateMockLiveSignals,
} from '@/lib/mockData'
import { LiveSignal, LiveObservation } from '@/lib/types'

// --- Data from Modes Page ---
const modes = [
  {
    id: 'pitch',
    name: 'Pitch Mode',
    description: 'Optimized for startup pitches and presentations',
    idealPace: '140-160 WPM',
    characteristics: [
      'Higher energy and enthusiasm',
      'More gesture tolerance',
      'Clear value proposition delivery',
      'Engaging storytelling',
    ],
  },
  {
    id: 'interview',
    name: 'Interview Mode',
    description: 'Professional communication for job interviews',
    idealPace: '120-150 WPM',
    characteristics: [
      'Professional tone',
      'Structured responses',
      'Moderate gesture usage',
      'Confident but not overbearing',
    ],
  },
  {
    id: 'professional',
    name: 'Professional / Office Mode',
    description: 'Business meetings and workplace communication',
    idealPace: '130-160 WPM',
    characteristics: [
      'Calm and measured delivery',
      'Minimal gestures',
      'Clear and concise',
      'Respectful tone',
    ],
  },
  {
    id: 'debate',
    name: 'Debate Mode',
    description: 'Assertive communication for debates and discussions',
    idealPace: '150-180 WPM',
    characteristics: [
      'Confident and assertive',
      'Strong gestures',
      'Quick thinking',
      'Clear argumentation',
    ],
  },
  {
    id: 'conversation',
    name: 'Daily Conversation Mode',
    description: 'Natural, everyday speaking',
    idealPace: '120-180 WPM',
    characteristics: [
      'Natural and relaxed',
      'Flexible pace',
      'Casual tone',
      'Comfortable flow',
    ],
  },
]

// --- Data from Scenarios Page ---
const scenarios = [
  {
    id: 'startup-pitch',
    title: 'Startup Pitch',
    icon: Lightbulb,
    description: 'Practice pitching your idea to investors',
    prompt: 'Introduce your startup idea in 2 minutes. Explain the problem, your solution, and why it matters.',
    mode: 'pitch',
  },
  {
    id: 'job-interview',
    title: 'Job Interview',
    icon: Briefcase,
    description: 'Prepare for job interviews',
    prompt: 'Tell me about yourself. Walk through your background, experience, and why you\'re interested in this role.',
    mode: 'interview',
  },
  {
    id: 'team-meeting',
    title: 'Team Meeting',
    icon: Users,
    description: 'Practice presenting in team meetings',
    prompt: 'Present a project update to your team. Share progress, challenges, and next steps.',
    mode: 'professional',
  },
  {
    id: 'client-call',
    title: 'Client Call',
    icon: Phone,
    description: 'Practice client communication',
    prompt: 'Explain a complex concept to a client in simple terms. Make sure they understand the value proposition.',
    mode: 'professional',
  },
  {
    id: 'ordering-food',
    title: 'Ordering Food',
    icon: Utensils,
    description: 'Practice everyday conversations',
    prompt: 'Order food at a restaurant. Include dietary preferences and ask questions about the menu.',
    mode: 'conversation',
  },
]

export default function PracticeSessionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentSession, startSession, endSession, updateSessionMetrics, user } = useStore()

  // States
  const [setupStep, setSetupStep] = useState<'selection' | 'preview'>('selection')
  const [activeTab, setActiveTab] = useState<'modes' | 'scenarios'>('modes')
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(true)

  // Session Configuration
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<typeof scenarios[0] | null>(null)

  // Real-time Data
  const [currentMetrics, setCurrentMetrics] = useState<any>(null)
  const [reassurance, setReassurance] = useState<string>('')
  const [liveSignals, setLiveSignals] = useState<LiveSignal[]>([])
  const [liveObservations, setLiveObservations] = useState<LiveObservation[]>([])
  const [liveTranscript, setLiveTranscript] = useState<string>('')
  const [detectedPatterns, setDetectedPatterns] = useState<string[]>([])
  const [scenarioEvents, setScenarioEvents] = useState<any[]>([])

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const orchestratorRef = useRef<OrchestratorAgent | null>(null)
  const observationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    orchestratorRef.current = new OrchestratorAgent()
    setLiveSignals(generateMockLiveSignals())

    // Check URL params for quick start
    const urlScenario = searchParams.get('scenario')
    const urlMode = searchParams.get('mode')

    if (urlScenario) {
      const found = scenarios.find(s => s.id === urlScenario)
      if (found) {
        handleScenarioSelect(found)
      }
    } else if (urlMode) {
      setSelectedMode(urlMode)
      setSetupStep('preview')
    }

    return () => cleanup()
  }, [])

  const cleanup = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    if (observationIntervalRef.current) {
      clearInterval(observationIntervalRef.current)
    }
  }

  // Effect to attach stream to video element when it becomes available
  useEffect(() => {
    if (isRecording && cameraEnabled && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current
    }
  }, [isRecording, cameraEnabled])

  // --- Logic Handlers ---

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId)
    setSelectedScenario(null)
    setSetupStep('preview')
  }

  const handleScenarioSelect = (scenario: typeof scenarios[0]) => {
    setSelectedScenario(scenario)
    setSelectedMode(scenario.mode) // Scenario implies a mode
    setSetupStep('preview')
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: cameraEnabled,
      })

      mediaStreamRef.current = stream


      if (cameraEnabled && videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // Audio Setup
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 2048
      source.connect(analyserRef.current)

      // Start Session in Store
      startSession(selectedMode || 'conversation', selectedScenario?.title)

      setIsRecording(true)
      setIsPaused(false)
      setLiveObservations([])
      setLiveTranscript('')
      setDetectedPatterns([])

      // Start Analysis Loop
      analyzeAudio()

      // Start Event Simulators
      startSimulators()

    } catch (error) {
      console.error('Error accessing media devices:', error)
      alert('Please allow microphone access to start practicing.')
    }
  }

  const analyzeAudio = () => {
    if (!analyserRef.current || !orchestratorRef.current || !isRecording || isPaused) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Float32Array(bufferLength)
    analyserRef.current.getFloatTimeDomainData(dataArray)

    orchestratorRef.current.processAudio(dataArray, selectedMode || 'conversation').then((results) => {
      const speechResult = results.find(r => r.agent === 'speech-signal')
      const fluencyResult = results.find(r => r.agent === 'fluency')

      if (speechResult) {
        updateSessionMetrics({
          stress: [speechResult.data.stress],
          pitch: [speechResult.data.pitch],
          volume: [speechResult.data.volume],
          pace: [speechResult.data.pace],
          fillerWords: [speechResult.data.fillerWords],
        })
        setCurrentMetrics(speechResult.data)
      }

      if (fluencyResult && fluencyResult.data.reassurance) {
        setReassurance(fluencyResult.data.reassurance)
      }

      if (isRecording && !isPaused) {
        requestAnimationFrame(analyzeAudio)
      }
    })
  }

  const startSimulators = () => {
    // 1. Observations Simulator
    observationIntervalRef.current = setInterval(() => {
      const newObservation: LiveObservation = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        message: ['Pace increasing', 'Stress spike detected', 'Good clarity', 'Volume consistent'][Math.floor(Math.random() * 4)],
        type: ['pace', 'stress', 'general', 'volume'][Math.floor(Math.random() * 4)] as any,
        suggestion: Math.random() > 0.7 ? 'Keep it up!' : undefined,
      }
      setLiveObservations(prev => [newObservation, ...prev].slice(0, 5))
      setLiveObservations(prev => [newObservation, ...prev].slice(0, 5))
    }, 5000)

    // 1.5 Transcript Simulator
    setInterval(() => {
      const phrases = [
        "I'm trying to explain the core value proposition...",
        "So, effectively, the issue is that...",
        "As we move forward with this strategy...",
        "The market opportunity is clearly huge...",
        "We need to address the scalability concerns...",
      ]
      const phrase = phrases[Math.floor(Math.random() * phrases.length)]
      setLiveTranscript(prev => (prev ? prev + ' ' + phrase : phrase))
    }, 3000)

    // 2. Scenario Event Simulator (if scenario active)
    if (selectedScenario) {
      // ... (Logic to push scenario events, simplified for brevity)
    }
  }

  const stopRecording = () => {
    cleanup()
    setIsRecording(false)
    setIsPaused(false)
    const endedSession = endSession()

    if (endedSession) {
      router.push(`/dashboard/insights?session=${endedSession.id}`)
    }
  }

  // --- Render ---

  // 1. Selection Screen
  if (setupStep === 'selection') {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Start a Live Session</h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('modes')}
            className={`pb-4 px-6 text-lg font-medium transition-colors ${activeTab === 'modes'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Purpose Modes
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`pb-4 px-6 text-lg font-medium transition-colors ${activeTab === 'scenarios'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Scenario Simulator
          </button>
        </div>

        {/* Modes Tab */}
        {activeTab === 'modes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleModeSelect(mode.id)}
                className="text-left bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-6 h-6 text-primary-600" />
                  <h3 className="text-xl font-semibold text-gray-900">{mode.name}</h3>
                </div>
                <p className="text-gray-600 mb-4 text-sm">{mode.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded">
                  <Clock className="w-4 h-4" />
                  <span>Ideal Pace: {mode.idealPace}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Scenarios Tab */}
        {activeTab === 'scenarios' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map((scenario) => {
              const Icon = scenario.icon
              return (
                <button
                  key={scenario.id}
                  onClick={() => handleScenarioSelect(scenario)}
                  className="text-left bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-accent-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{scenario.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2">{scenario.description}</p>
                  <div className="text-sm bg-gray-50 p-3 rounded text-gray-700">
                    <span className="font-medium">Prompt:</span> {scenario.prompt}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // 2. Preview / Setup Screen
  if (setupStep === 'preview' && !isRecording) {
    const activeMode = modes.find(m => m.id === selectedMode)

    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setSetupStep('selection')}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          ← Back to Selection
        </button>

        <h1 className="text-3xl font-bold mb-2 text-gray-900">Ready to Practice?</h1>
        <p className="text-gray-600 mb-8">
          You chose <strong>{selectedScenario ? selectedScenario.title : activeMode?.name}</strong>.
          Adjust your settings below before starting.
        </p>

        {selectedScenario && (
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2 text-blue-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Scenario Prompt
            </h2>
            <p className="text-blue-800 text-lg">{selectedScenario.prompt}</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-lg font-medium text-gray-700 flex items-center gap-2">
              <Video className="w-5 h-5" />
              Camera Feed
            </label>
            <button
              onClick={() => setCameraEnabled(!cameraEnabled)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${cameraEnabled ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                }`}
            >
              {cameraEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="bg-black rounded-lg overflow-hidden aspect-video relative flex items-center justify-center">
            {cameraEnabled ? (
              <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <p className="text-gray-400 text-sm">Camera will start when session begins</p>
              </div>
            ) : (
              <div className="text-white text-center opacity-50">
                <VideoOff className="w-16 h-16 mx-auto mb-2" />
                <p>Camera Disabled</p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={startRecording}
          className="w-full bg-primary-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Mic className="w-6 h-6" />
          Start Session
        </button>
      </div>
    )
  }

  // 3. Active Recording Interface
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
          Live Session
        </h1>
        <div className="bg-gray-100 px-4 py-2 rounded-lg text-gray-700 font-medium">
          {selectedScenario ? selectedScenario.title : modes.find(m => m.id === selectedMode)?.name}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed Area */}
        <div className="lg:col-span-2 space-y-4">

          {/* Top Overlay: Live Signal Bar (MOVED OUTSIDE) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <LiveSignalBar signals={liveSignals} />
          </div>

          <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
            {cameraEnabled ? (
              <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                  <Mic className="w-24 h-24 mx-auto mb-4 opacity-50" />
                  <p className="text-lg opacity-75">Audio Only Mode</p>
                </div>
              </div>
            )}

            {/* Agents Overlay */}
            {reassurance && (
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-black/60 backdrop-blur-md text-white p-4 rounded-xl border border-white/10 animate-fade-in">
                  <p className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    {reassurance}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-center gap-4">
            {isPaused ? (
              <button onClick={() => { setIsPaused(false); analyzeAudio() }} className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2">
                <Play className="w-5 h-5" /> Resume
              </button>
            ) : (
              <button onClick={() => setIsPaused(true)} className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 flex items-center gap-2">
                <Pause className="w-5 h-5" /> Pause
              </button>
            )}
            <button onClick={stopRecording} className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 flex items-center gap-2">
              <Square className="w-5 h-5" /> End Session
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Live Transcript */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-64 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Live Transcript
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {liveTranscript || "Start speaking to see transcript..."}
              </p>
            </div>

            {/* Live Observations Feed */}
            <div className="h-64">
              <LiveObservationFeed observations={liveObservations} />
            </div>
          </div>
        </div>

        {/* Sidebar Metrics */}
        <div className="space-y-6">
          {currentMetrics && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Detailed Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pace</span>
                  <span className="font-medium">{Math.round(currentMetrics.pace)} WPM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Volume</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${currentMetrics.volume * 100}%` }} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fillers</span>
                  <span className="font-medium">{Math.round(currentMetrics.fillerWords)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Session Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Mode</span>
                <span className="font-medium capitalize">{selectedMode}</span>
              </div>
              {selectedScenario && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Scenario</span>
                  <span className="font-medium text-right max-w-[150px] truncate">{selectedScenario.title}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium">00:00</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
            <p className="text-xs text-indigo-800 leading-relaxed">
              <strong>AI Agent Active:</strong> Analyzing speech patterns, tone, and pacing in real-time to provide contextual feedback based on {selectedScenario ? 'scenario' : 'mode'} parameters.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
