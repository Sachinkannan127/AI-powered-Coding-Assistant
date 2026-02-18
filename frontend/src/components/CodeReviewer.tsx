import { useState } from 'react'
import { FaCheckCircle, FaExclamationTriangle, FaStar } from 'react-icons/fa'
import { reviewCode } from '../services/api'

export default function CodeReviewer() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleReview = async () => {
    if (!code.trim()) {
      alert('Please enter some code to review')
      return
    }

    setLoading(true)
    setResult(null)
    try {
      console.log('Sending review request...', { code: code.substring(0, 100), language })
      const reviewResult = await reviewCode(code, language, context || undefined)
      console.log('Review result:', reviewResult)
      setResult(reviewResult)
    } catch (error: any) {
      console.error('Code review failed:', error)
      const errorMsg = error?.response?.data?.detail || error?.message || 'Failed to review code'
      alert(`Error: ${errorMsg}. Please check console for details.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 gradient-text">AI Code Reviewer</h2>
        <p className="text-slate-400 mb-6">
          Get AI-powered code review with best practices, security analysis, and improvement suggestions
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input-field"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="java">Java</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="cpp">C++</option>
                <option value="csharp">C#</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Context (optional)
              </label>
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g., API endpoint, data processor"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Code to Review
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here for AI review..."
              className="input-field font-mono text-sm"
              rows={12}
            />
          </div>

          <button
            onClick={handleReview}
            disabled={loading || !code.trim()}
            className="btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Reviewing Code...
              </span>
            ) : (
              'Review Code'
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Review Results</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">Overall Score:</span>
              <span className={`text-2xl font-bold ${
                result.overall_score >= 80 ? 'text-green-400' :
                result.overall_score >= 60 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {result.overall_score}/100
              </span>
            </div>
          </div>

          {result.strengths && result.strengths.length > 0 && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 flex items-center mb-3">
                <FaStar className="mr-2" />
                Strengths
              </h4>
              <ul className="space-y-2">
                {result.strengths.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start text-green-200 text-sm">
                    <FaCheckCircle className="mr-2 mt-1 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.issues && result.issues.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-400 flex items-center mb-3">
                <FaExclamationTriangle className="mr-2" />
                Issues Found
              </h4>
              <ul className="space-y-2">
                {result.issues.map((issue: string, index: number) => (
                  <li key={index} className="flex items-start text-yellow-200 text-sm">
                    <span className="mr-2">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.suggestions && result.suggestions.length > 0 && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-blue-400 mb-3">Suggestions for Improvement</h4>
              <ul className="space-y-2">
                {result.suggestions.map((suggestion: string, index: number) => (
                  <li key={index} className="text-blue-200 text-sm flex items-start">
                    <span className="mr-2">→</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.review && (
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">Detailed Review</h4>
              <pre className="text-slate-300 text-sm whitespace-pre-wrap">{result.review}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
