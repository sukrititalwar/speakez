import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-6xl font-bold text-gray-900 mb-6">
              SPEAKEZ
            </h1>
            <p className="text-2xl text-gray-700 mb-4">
              Understand how you speak. Learn how to practice.
            </p>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              A supportive platform that detects speech patterns, explains where and why speech breaks,
              and guides you on how to practice better. No judgment. No grading. Just understanding and growth.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            >
              Practice Your Speech
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Pattern Detection
              </h3>
              <p className="text-gray-600">
                Understand your speech patterns, including stress, pace, and clarity—all without judgment.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Guided Practice
              </h3>
              <p className="text-gray-600">
                Practice for real-world scenarios like pitches, interviews, and daily conversations.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Personalized Roadmap
              </h3>
              <p className="text-gray-600">
                Follow a step-by-step improvement plan tailored to your unique speaking style.
              </p>
            </div>
          </div>

          {/* Philosophy Section */}
          <div className="mt-16 bg-white/80 backdrop-blur-sm p-8 rounded-lg border border-gray-200">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Our Philosophy
            </h2>
            <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto">
              SPEAKEZ is not an evaluation or grading system. We believe in understanding, not judging.
              Every voice is unique, and our platform adapts to your personal baseline. Whether you're
              working with speech differences, building confidence, or preparing for specific scenarios,
              we're here to support your journey with dignity and inclusion.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
