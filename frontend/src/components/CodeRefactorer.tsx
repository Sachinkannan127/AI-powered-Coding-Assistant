import { useState } from 'react'
import { FaCode, FaExchangeAlt } from 'react-icons/fa'
import { refactorCode } from '../services/api'

export default function CodeRefactorer() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [refactorType, setRefactorType] = useState('general')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleRefactor = async () => {
    if (!code.trim()) {
      alert('Please enter some code to refactor')
      return
    }

    setLoading(true)
    setResult(null)
    try {
      console.log('Sending refactor request...', { language, refactorType })
      const refactorResult = await refactorCode(code, language, refactorType)
      console.log('Refactor result:', refactorResult)
      setResult(refactorResult)
    } catch (error: any) {
      console.error('Refactoring failed:', error)
      const errorMsg = error?.response?.data?.detail || error?.message || 'Failed to refactor code'
      alert(`Error: ${errorMsg}. Please check console for details.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 gradient-text">Code Refactorer</h2>
        <p className="text-slate-400 mb-6">
          Automatically refactor your code for better quality, performance, and maintainability
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
                Refactor Type
              </label>
              <select
                value={refactorType}
                onChange={(e) => setRefactorType(e.target.value)}
                className="input-field"
              >
                <option value="general">General Improvement</option>
                <option value="performance">Performance Optimization</option>
                <option value="clean_code">Clean Code Principles</option>
                <option value="design_patterns">Design Patterns</option>
                <option value="simplify">Simplify & Reduce Complexity</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Original Code
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here for refactoring..."
              className="input-field font-mono text-sm"
              rows={12}
            />
          </div>

          <button
            onClick={handleRefactor}
            disabled={loading || !code.trim()}
            className="btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refactoring...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <FaExchangeAlt className="mr-2" />
                Refactor Code
              </span>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="card space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center">
            <FaCode className="mr-2 text-primary-400" />
            Refactored Code
          </h3>

          {result.changes && result.changes.length > 0 && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-blue-400 mb-3">Changes Made</h4>
              <ul className="space-y-2">
                {result.changes.map((change: string, index: number) => (
                  <li key={index} className="text-blue-200 text-sm flex items-start">
                    <span className="mr-2">✓</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white">Refactored Code</h4>
              <button
                onClick={() => navigator.clipboard.writeText(result.refactored_code)}
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                Copy to Clipboard
              </button>
            </div>
            <pre className="text-slate-300 text-sm overflow-x-auto">
              <code>{result.refactored_code}</code>
            </pre>
          </div>

          {result.benefits && result.benefits.length > 0 && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 mb-3">Benefits</h4>
              <ul className="space-y-2">
                {result.benefits.map((benefit: string, index: number) => (
                  <li key={index} className="text-green-200 text-sm flex items-start">
                    <span className="mr-2">★</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.explanation && (
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">Detailed Explanation</h4>
              <pre className="text-slate-300 text-sm whitespace-pre-wrap">{result.explanation}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
