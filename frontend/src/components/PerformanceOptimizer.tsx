import { useState } from 'react'
import { FaRocket, FaTachometerAlt } from 'react-icons/fa'
import { optimizeCode } from '../services/api'

export default function PerformanceOptimizer() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleOptimize = async () => {
    if (!code.trim()) {
      alert('Please enter some code to optimize')
      return
    }

    setLoading(true)
    setResult(null)
    try {
      console.log('Sending optimization request...', { language, context })
      const optimizationResult = await optimizeCode(code, language, context || undefined)
      console.log('Optimization result:', optimizationResult)
      setResult(optimizationResult)
    } catch (error: any) {
      console.error('Optimization failed:', error)
      const errorMsg = error?.response?.data?.detail || error?.message || 'Failed to optimize code'
      alert(`Error: ${errorMsg}. Please check console for details.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 gradient-text">Performance Optimizer</h2>
        <p className="text-slate-400 mb-6">
          Analyze and optimize your code for better performance with AI-powered suggestions
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
                placeholder="e.g., handles large datasets"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Code to Optimize
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here for performance optimization..."
              className="input-field font-mono text-sm"
              rows={12}
            />
          </div>

          <button
            onClick={handleOptimize}
            disabled={loading || !code.trim()}
            className="btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Optimizing...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <FaRocket className="mr-2" />
                Optimize Performance
              </span>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center">
              <FaTachometerAlt className="mr-2 text-primary-400" />
              Optimization Results
            </h3>
            {result.performance_gain && (
              <div className="bg-green-900/30 border border-green-500/50 px-4 py-2 rounded-lg">
                <span className="text-green-300 font-semibold">{result.performance_gain}</span>
              </div>
            )}
          </div>

          {result.bottlenecks && result.bottlenecks.length > 0 && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-red-400 mb-3">Performance Bottlenecks</h4>
              <ul className="space-y-2">
                {result.bottlenecks.map((bottleneck: string, index: number) => (
                  <li key={index} className="text-red-200 text-sm flex items-start">
                    <span className="mr-2">⚠</span>
                    <span>{bottleneck}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.complexity_analysis && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-400 mb-2">Complexity Analysis</h4>
              <p className="text-yellow-200 text-sm font-mono">{result.complexity_analysis}</p>
            </div>
          )}

          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white">Optimized Code</h4>
              <button
                onClick={() => navigator.clipboard.writeText(result.optimized_code)}
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                Copy to Clipboard
              </button>
            </div>
            <pre className="text-slate-300 text-sm overflow-x-auto max-h-96">
              <code>{result.optimized_code}</code>
            </pre>
          </div>

          {result.improvements && result.improvements.length > 0 && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 mb-3">Optimizations Applied</h4>
              <ul className="space-y-2">
                {result.improvements.map((improvement: string, index: number) => (
                  <li key={index} className="text-green-200 text-sm flex items-start">
                    <span className="mr-2">✓</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.analysis && (
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">Detailed Analysis</h4>
              <pre className="text-slate-300 text-sm whitespace-pre-wrap">{result.analysis}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
