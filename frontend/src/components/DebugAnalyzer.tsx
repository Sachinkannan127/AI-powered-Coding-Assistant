import { useState } from 'react'
import { FaBug, FaSpinner, FaCheckCircle } from 'react-icons/fa'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import apiService, { DebugResponse } from '../services/api'

const LANGUAGES = [
  'python', 'javascript', 'typescript', 'java', 'cpp', 'csharp',
  'go', 'rust', 'php', 'ruby', 'swift', 'kotlin'
]

function DebugAnalyzer() {
  const [code, setCode] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [language, setLanguage] = useState('python')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DebugResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError('Please enter code to analyze')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await apiService.debugCode({
        code,
        error_message: errorMessage || undefined,
        language
      })
      setResult(response)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze code')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'text-red-400 bg-red-900/30 border-red-500'
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/30 border-yellow-500'
      default:
        return 'text-green-400 bg-green-900/30 border-green-500'
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <FaBug className="text-3xl text-red-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">Debug Analyzer</h2>
              <p className="text-slate-400 text-sm">Find and fix bugs in your code</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Programming Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input-field"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Error Message (Optional)
              </label>
              <input
                type="text"
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                placeholder="e.g., TypeError: 'NoneType' object is not iterable"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Code to Debug
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                rows={12}
                className="textarea-field"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <FaBug />
                  <span>Analyze Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-4">Analysis Results</h3>

          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-4">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {result ? (
            <div className="space-y-4">
              {/* Severity Badge */}
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border ${getSeverityColor(result.severity)}`}>
                <span className="font-semibold">Severity: {result.severity}</span>
              </div>

              {/* Analysis */}
              <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-300 mb-2 flex items-center space-x-2">
                  <FaBug />
                  <span>Analysis</span>
                </h4>
                <p className="text-slate-300 text-sm whitespace-pre-wrap">{result.analysis}</p>
              </div>

              {/* Suggestions */}
              {result.suggestions && result.suggestions.length > 0 && (
                <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-300 mb-3 flex items-center space-x-2">
                    <FaCheckCircle />
                    <span>Suggestions</span>
                  </h4>
                  <ul className="space-y-2">
                    {result.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-slate-300 text-sm flex items-start space-x-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fixed Code */}
              {result.fixed_code && (
                <div>
                  <h4 className="font-semibold text-slate-300 mb-2">Fixed Code</h4>
                  <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{
                      borderRadius: '0.5rem',
                      padding: '1.5rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    {result.fixed_code}
                  </SyntaxHighlighter>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaBug className="text-6xl text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">
                {loading ? 'Analyzing your code...' : 'Analysis results will appear here'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DebugAnalyzer
