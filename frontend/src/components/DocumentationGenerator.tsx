import { useState } from 'react'
import { FaBook, FaFileAlt } from 'react-icons/fa'
import { generateDocumentation } from '../services/api'

export default function DocumentationGenerator() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [docType, setDocType] = useState('comprehensive')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleGenerateDocs = async () => {
    if (!code.trim()) {
      alert('Please enter some code to document')
      return
    }

    setLoading(true)
    setResult(null)
    try {
      console.log('Sending documentation generation request...', { language, docType })
      const docsResult = await generateDocumentation(code, language, docType)
      console.log('Documentation result:', docsResult)
      setResult(docsResult)
    } catch (error: any) {
      console.error('Documentation generation failed:', error)
      const errorMsg = error?.response?.data?.detail || error?.message || 'Failed to generate documentation'
      alert(`Error: ${errorMsg}. Please check console for details.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 gradient-text">Documentation Generator</h2>
        <p className="text-slate-400 mb-6">
          Generate comprehensive documentation for your code automatically with AI
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
                Documentation Type
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="input-field"
              >
                <option value="comprehensive">Comprehensive</option>
                <option value="inline">Inline Comments</option>
                <option value="api">API Documentation</option>
                <option value="readme">README</option>
                <option value="tutorial">Tutorial</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Code to Document
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here to generate documentation..."
              className="input-field font-mono text-sm"
              rows={12}
            />
          </div>

          <button
            onClick={handleGenerateDocs}
            disabled={loading || !code.trim()}
            className="btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Documentation...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <FaBook className="mr-2" />
                Generate Documentation
              </span>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="card space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center">
            <FaFileAlt className="mr-2 text-primary-400" />
            Generated Documentation
          </h3>

          {result.inline_comments && docType === 'inline' && (
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white">Code with Inline Comments</h4>
                <button
                  onClick={() => navigator.clipboard.writeText(result.inline_comments)}
                  className="text-sm text-primary-400 hover:text-primary-300"
                >
                  Copy to Clipboard
                </button>
              </div>
              <pre className="text-slate-300 text-sm overflow-x-auto max-h-96">
                <code>{result.inline_comments}</code>
              </pre>
            </div>
          )}

          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white">Documentation</h4>
              <button
                onClick={() => navigator.clipboard.writeText(result.documentation)}
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                Copy to Clipboard
              </button>
            </div>
            <div className="prose prose-invert max-w-none">
              <pre className="text-slate-300 text-sm whitespace-pre-wrap overflow-x-auto max-h-96">
                {result.documentation}
              </pre>
            </div>
          </div>

          {result.examples && result.examples.length > 0 && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-blue-400 mb-3">Usage Examples</h4>
              <div className="space-y-3">
                {result.examples.map((example: string, index: number) => (
                  <div key={index} className="bg-slate-900/50 rounded p-3">
                    <pre className="text-blue-200 text-sm overflow-x-auto">
                      <code>{example}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.markdown && (
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white">Markdown Format</h4>
                <button
                  onClick={() => navigator.clipboard.writeText(result.markdown)}
                  className="text-sm text-primary-400 hover:text-primary-300"
                >
                  Copy Markdown
                </button>
              </div>
              <pre className="text-slate-300 text-sm whitespace-pre-wrap overflow-x-auto max-h-64">
                {result.markdown}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
