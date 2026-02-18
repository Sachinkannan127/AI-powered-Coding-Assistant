import { useState } from 'react'
import { FaFlask, FaCheckSquare } from 'react-icons/fa'
import { generateTests } from '../services/api'

export default function TestGenerator() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [testFramework, setTestFramework] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const frameworkOptions: Record<string, string[]> = {
    python: ['pytest', 'unittest', 'nose'],
    javascript: ['jest', 'mocha', 'jasmine'],
    typescript: ['jest', 'mocha', 'vitest'],
    java: ['junit', 'testng'],
    go: ['testing'],
    csharp: ['nunit', 'xunit', 'mstest']
  }

  const handleGenerateTests = async () => {
    if (!code.trim()) {
      alert('Please enter some code to generate tests for')
      return
    }

    setLoading(true)
    setResult(null)
    try {
      console.log('Sending test generation request...', { language, testFramework })
      const testResult = await generateTests(code, language, testFramework || undefined)
      console.log('Test generation result:', testResult)
      setResult(testResult)
    } catch (error: any) {
      console.error('Test generation failed:', error)
      const errorMsg = error?.response?.data?.detail || error?.message || 'Failed to generate tests'
      alert(`Error: ${errorMsg}. Please check console for details.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 gradient-text">Test Generator</h2>
        <p className="text-slate-400 mb-6">
          Automatically generate comprehensive unit tests for your code with AI
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value)
                  setTestFramework('')
                }}
                className="input-field"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="java">Java</option>
                <option value="go">Go</option>
                <option value="csharp">C#</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Test Framework (optional)
              </label>
              <select
                value={testFramework}
                onChange={(e) => setTestFramework(e.target.value)}
                className="input-field"
              >
                <option value="">Auto-detect</option>
                {frameworkOptions[language]?.map(framework => (
                  <option key={framework} value={framework}>{framework}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Code to Test
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here to generate test cases..."
              className="input-field font-mono text-sm"
              rows={12}
            />
          </div>

          <button
            onClick={handleGenerateTests}
            disabled={loading || !code.trim()}
            className="btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Tests...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <FaFlask className="mr-2" />
                Generate Tests
              </span>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center">
              <FaCheckSquare className="mr-2 text-green-400" />
              Generated Tests
            </h3>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-400">{result.coverage_estimate}%</div>
                <div className="text-xs text-slate-400">Est. Coverage</div>
              </div>
            </div>
          </div>

          {result.framework && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-blue-400 font-medium">Framework: {result.framework}</span>
                {result.setup_instructions && (
                  <button
                    className="text-sm text-blue-300 hover:text-blue-200"
                    onClick={() => alert(result.setup_instructions)}
                  >
                    Setup Instructions
                  </button>
                )}
              </div>
            </div>
          )}

          {result.test_cases && result.test_cases.length > 0 && (
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">Test Cases Generated</h4>
              <ul className="space-y-2">
                {result.test_cases.map((testCase: string, index: number) => (
                  <li key={index} className="text-slate-300 text-sm flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span className="font-mono">{testCase}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white">Test Code</h4>
              <button
                onClick={() => navigator.clipboard.writeText(result.test_code)}
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                Copy to Clipboard
              </button>
            </div>
            <pre className="text-slate-300 text-sm overflow-x-auto max-h-96">
              <code>{result.test_code}</code>
            </pre>
          </div>

          {result.explanation && (
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">Explanation</h4>
              <pre className="text-slate-300 text-sm whitespace-pre-wrap">{result.explanation}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
