import Link from 'next/link'
import { Sparkles, Mic, Activity, Map, ArrowRight, Heart } from 'lucide-react'

export default function LandingPage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-50 via-white to-purple-50">

      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-pink-100/30 rounded-full blur-2xl animate-bounce duration-[10s]"></div>

        {/* Floating Particles */}
        <div className="absolute top-[10%] left-[10%] w-3 h-3 bg-blue-400/40 rounded-full animate-float"></div>
        <div className="absolute top-[20%] right-[20%] w-5 h-5 bg-purple-400/40 rounded-full animate-float delay-[2000ms]"></div>
        <div className="absolute bottom-[30%] left-[40%] w-2 h-2 bg-pink-400/40 rounded-full animate-float delay-[4000ms]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-4 h-4 bg-indigo-400/40 rounded-full animate-float delay-[1000ms]"></div>

        {/* Drifting Clouds */}
        <div className="absolute top-[30%] right-[30%] w-32 h-32 bg-indigo-200/10 rounded-full blur-xl animate-drift"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-5xl mx-auto text-center">

          {/* Hero Section */}
          <div className="mb-20 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-purple-100 shadow-sm mb-8 animate-fade-in-up">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <span className="text-sm font-semibold text-purple-600 tracking-wide uppercase">Team HerTech Presents</span>
            </div>

            <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 mb-8 tracking-tight leading-loose py-2">
              SPEAKEZ
            </h1>

            <p className="text-3xl md:text-4xl text-gray-800 font-light mb-6 tracking-tight">
              Every Voice deserves to be <span className="font-semibold text-purple-600">Understood</span>.
            </p>

            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              An intelligent, adaptive platform that decodes your speech patterns, visualizes your delivery,
              and guides you to confidence. <br />
              <span className="font-medium text-gray-900 mt-2 block">No judgment. Just Code & Clarity.</span>
            </p>

            <Link
              href="/dashboard/practice"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.4)] overflow-hidden"
            >
              <span className="mr-2">Start Practice Session</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16 perspective-1000">
            {/* Card 1 */}
            <div className="group bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 hover:shadow-[0_20px_50px_rgba(37,99,235,0.1)] transition-all duration-500 hover:-translate-y-2">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform duration-500">
                <Activity className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Pattern Intelligence
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Real-time detection of stress, pace, and clarity using advanced DSP signals. See your voice in data.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 hover:shadow-[0_20px_50px_rgba(147,51,234,0.1)] transition-all duration-500 hover:-translate-y-2">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform duration-500">
                <Mic className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Guided Simulation
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Immersive practice scenarios for pitches and interviews with live, adaptive feedback.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 hover:shadow-[0_20px_50px_rgba(236,72,153,0.1)] transition-all duration-500 hover:-translate-y-2">
              <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center mb-6 text-pink-600 group-hover:scale-110 transition-transform duration-500">
                <Map className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Adaptive Roadmap
              </h3>
              <p className="text-gray-600 leading-relaxed">
                A personalized path to improvement that evolves with your unique speaking style.
              </p>
            </div>
          </div>

          {/* Philosophy Section */}
          <div className="mt-24 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="relative bg-white/80 backdrop-blur-md p-10 rounded-3xl border border-white shadow-sm">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Heart className="w-6 h-6 text-red-500 fill-current animate-pulse" />
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Our Philosophy
                </h2>
              </div>
              <p className="text-lg text-gray-700 leading-loose max-w-4xl mx-auto font-medium">
                "SPEAKEZ is not an evaluation system. It's a mirror." <br />
                We believe in understanding, not judging. Every voice is unique, and our platform adapts to
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 font-bold"> your personal baseline</span>.
                Whether you're overcoming speech anxiety or mastering executive presence, we're here to support your journey with dignity.
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
