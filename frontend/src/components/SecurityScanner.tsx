import { useState } from 'react'
import { FaShieldAlt, FaSpinner, FaExclamationTriangle } from 'react-icons/fa'
import apiService, { SecurityScanResponse, SecurityIssue } from '../services/api'

const LANGUAGES = [
  'python', 'javascript', 'typescript', 'java', 'cpp', 'csharp',
  'go', 'rust', 'php', 'ruby', 'swift', 'kotlin'
]

function SecurityScanner() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SecurityScanResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleScan = async () => {
    if (!code.trim()) {
      setError('Please enter code to scan')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await apiService.scanSecurity({
        code,
        language
      })
      setResult(response)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to scan code')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'bg-red-900/30 border-red-500 text-red-300'
      case 'medium':
        return 'bg-yellow-900/30 border-yellow-500 text-yellow-300'
      default:
        return 'bg-blue-900/30 border-blue-500 text-blue-300'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'text-red-400'
      case 'medium':
        return 'text-yellow-400'
      default:
        return 'text-green-400'
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <FaShieldAlt className="text-3xl text-purple-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">Security Scanner</h2>
              <p className="text-slate-400 text-sm">Detect vulnerabilities in your code</p>
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
                Code to Scan
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here for security analysis..."
                rows={15}
                className="textarea-field"
              />
            </div>

            <button
              onClick={handleScan}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <FaShieldAlt />
                  <span>Scan for Vulnerabilities</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-4">Security Report</h3>

          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-4">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {result ? (
            <div className="space-y-4">
              {/* Overall Risk */}
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Overall Risk Level:</span>
                  <span className={`text-xl font-bold ${getRiskColor(result.overall_risk)}`}>
                    {result.overall_risk.toUpperCase()}
                  </span>
                </div>
                <div className="mt-2 text-sm text-slate-400">
                  Found {result.issues.length} potential {result.issues.length === 1 ? 'issue' : 'issues'}
                </div>
              </div>

              {/* Security Issues */}
              {result.issues.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-300 flex items-center space-x-2">
                    <FaExclamationTriangle className="text-yellow-500" />
                    <span>Detected Issues</span>
                  </h4>
                  {result.issues.map((issue: SecurityIssue, index: number) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${getSeverityColor(issue.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold">{issue.type}</span>
                            <span className="text-xs px-2 py-1 rounded bg-slate-900/50">
                              Line {issue.line}
                            </span>
                          </div>
                          <p className="text-sm opacity-90 mb-2">{issue.description}</p>
                        </div>
                        <span className="text-xs font-bold uppercase px-2 py-1 rounded bg-slate-900/50">
                          {issue.severity}
                        </span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-600/50">
                        <p className="text-xs font-semibold mb-1">Recommendation:</p>
                        <p className="text-sm opacity-90">{issue.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-6 text-center">
                  <FaShieldAlt className="text-4xl text-green-400 mx-auto mb-2" />
                  <p className="text-green-300 font-semibold">No security issues detected!</p>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-300 mb-3">General Recommendations</h4>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="text-slate-300 text-sm flex items-start space-x-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaShieldAlt className="text-6xl text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">
                {loading ? 'Scanning for vulnerabilities...' : 'Security report will appear here'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SecurityScanner
