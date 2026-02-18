import { useState } from 'react'
import { FaSearch, FaCode } from 'react-icons/fa'
import apiService from '../services/api'

export default function SemanticSearch() {
  const [query, setQuery] = useState('')
  const [language, setLanguage] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!query.trim()) {
      alert('Please enter a search query')
      return
    }

    setLoading(true)
    setError('')
    setResults([])
    
    try {
      console.log('Sending semantic search request...', { query, language })
      const response = await apiService.semanticSearch({
        query,
        limit: 10
      })
      console.log('Search results:', response)
      
      if (response.results && response.results.length > 0) {
        setResults(response.results)
      } else {
        setError('No results found. Try a different query or add some code snippets first.')
      }
    } catch (err: any) {
      console.error('Semantic search failed:', err)
      const errorMsg = err?.response?.data?.detail || err?.message || 'Search failed'
      
      if (errorMsg.includes('sentence-transformers') || errorMsg.includes('VectorStore')) {
        setError('Semantic search is not available. Install sentence-transformers on the backend: pip install sentence-transformers')
      } else {
        setError(`Error: ${errorMsg}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 gradient-text">Semantic Code Search</h2>
        <p className="text-slate-400 mb-6">
          Search for code snippets using natural language queries
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Search Query
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g., function to parse JSON data"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Language Filter (optional)
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input-field"
              >
                <option value="">All Languages</option>
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
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <FaSearch className="mr-2" />
                Search Code
              </span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="card bg-yellow-900/20 border-2 border-yellow-500/50">
          <div className="flex items-start">
            <FaSearch className="text-yellow-400 text-2xl mr-4 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-300 mb-2">Search Unavailable</h3>
              <p className="text-yellow-200 text-sm whitespace-pre-wrap">{error}</p>
              {error.includes('sentence-transformers') && (
                <div className="mt-4 bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-slate-300 font-mono">
                    # Install on backend:
                    <br />
                    pip install sentence-transformers
                    <br />
                    <br />
                    # Then restart the backend server
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-4">
            Search Results ({results.length})
          </h3>
          <div className="space-y-4">
            {results.map((result: any, index: number) => (
              <div
                key={index}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-primary-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <FaCode className="text-primary-400" />
                    <span className="text-sm font-medium text-slate-300">
                      {result.language || 'Unknown'}
                    </span>
                    {result.similarity && (
                      <span className="text-xs bg-primary-900/30 text-primary-300 px-2 py-1 rounded">
                        {Math.round(result.similarity * 100)}% match
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(result.code)}
                    className="text-sm text-primary-400 hover:text-primary-300"
                  >
                    Copy
                  </button>
                </div>

                {result.description && (
                  <p className="text-slate-400 text-sm mb-3">{result.description}</p>
                )}

                <div className="bg-slate-900/60 rounded p-3">
                  <pre className="text-slate-300 text-sm overflow-x-auto max-h-48">
                    <code>{result.code}</code>
                  </pre>
                </div>

                {result.timestamp && (
                  <p className="text-xs text-slate-500 mt-2">
                    Added: {new Date(result.timestamp).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && results.length === 0 && query && (
        <div className="card text-center py-8">
          <FaSearch className="text-4xl text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">
            No code snippets found. Generate or save some code first to build your search index.
          </p>
        </div>
      )}
    </div>
  )
}
