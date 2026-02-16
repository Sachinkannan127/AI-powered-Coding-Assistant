import { useState } from 'react'
import { FaCode, FaBug, FaShieldAlt, FaSearch, FaUser, FaSignOutAlt } from 'react-icons/fa'
import CodeGenerator from './components/CodeGenerator'
import DebugAnalyzer from './components/DebugAnalyzer'
import SecurityScanner from './components/SecurityScanner'
import AuthModal from './components/AuthModal'
import { useAuth } from './contexts/AuthContext'
import './index.css'

type Tab = 'generate' | 'debug' | 'security' | 'search'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('generate')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Smart DevCopilot</h1>
              <p className="text-slate-400 mt-1">AI-Powered Coding Assistant</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-400">Online</span>
              </div>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{user?.username}</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <FaUser />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-slate-800/30 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 ${
                activeTab === 'generate'
                  ? 'text-primary-400 border-b-2 border-primary-400 bg-slate-800/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <FaCode />
              <span>Code Generator</span>
            </button>
            <button
              onClick={() => setActiveTab('debug')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 ${
                activeTab === 'debug'
                  ? 'text-primary-400 border-b-2 border-primary-400 bg-slate-800/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <FaBug />
              <span>Debug Analyzer</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 ${
                activeTab === 'security'
                  ? 'text-primary-400 border-b-2 border-primary-400 bg-slate-800/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <FaShieldAlt />
              <span>Security Scanner</span>
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 ${
                activeTab === 'search'
                  ? 'text-primary-400 border-b-2 border-primary-400 bg-slate-800/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <FaSearch />
              <span>Semantic Search</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'generate' && <CodeGenerator />}
        {activeTab === 'debug' && <DebugAnalyzer />}
        {activeTab === 'security' && <SecurityScanner />}
        {activeTab === 'search' && (
          <div className="card text-center py-12">
            <FaSearch className="text-6xl text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              Semantic Search
            </h3>
            <p className="text-slate-400">
              Install sentence-transformers on the backend to enable semantic code search.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800/30 backdrop-blur-sm border-t border-slate-700 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-slate-400 text-sm">
            Powered by Google Gemini AI • Smart DevCopilot v1.0.0
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}

export default App
