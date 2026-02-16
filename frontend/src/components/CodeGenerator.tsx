import { useState } from 'react'
import { FaCode, FaSpinner } from 'react-icons/fa'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import apiService, { CodeGenerationResponse } from '../services/api'

const LANGUAGES = [
  'python', 'javascript', 'typescript', 'java', 'cpp', 'csharp',
  'go', 'rust', 'php', 'ruby', 'swift', 'kotlin'
]

function CodeGenerator() {
  const [prompt, setPrompt] = useState('')
  const [language, setLanguage] = useState('python')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CodeGenerationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await apiService.generateCode({
        prompt,
        language,
        max_tokens: 1000
      })
      setResult(response)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate code')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (result?.code) {
      navigator.clipboard.writeText(result.code)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <FaCode className="text-3xl text-primary-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">Code Generator</h2>
              <p className="text-slate-400 text-sm">Describe what you want to build</p>
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
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Create a function to calculate factorial using recursion"
                rows={8}
                className="textarea-field"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FaCode />
                  <span>Generate Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-4">Generated Code</h3>

          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-4">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {result ? (
            <div className="space-y-4">
              {result.explanation && (
                <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-300 mb-2">Explanation</h4>
                  <p className="text-slate-300 text-sm">{result.explanation}</p>
                </div>
              )}

              <div className="relative">
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-sm"
                >
                  Copy
                </button>
                <SyntaxHighlighter
                  language={result.language || language}
                  style={vscDarkPlus}
                  customStyle={{
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    fontSize: '0.875rem'
                  }}
                >
                  {result.code}
                </SyntaxHighlighter>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FaCode className="text-6xl text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">
                {loading ? 'Generating your code...' : 'Your generated code will appear here'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CodeGenerator
