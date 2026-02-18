import { useState } from 'react'
import { 
  FaCode, FaBug, FaShieldAlt, FaSearch, FaUser, FaSignOutAlt,
  FaCheckCircle, FaExchangeAlt, FaFlask, FaRocket, FaBook
} from 'react-icons/fa'
import CodeGenerator from './components/CodeGenerator'
import DebugAnalyzer from './components/DebugAnalyzer'
import SecurityScanner from './components/SecurityScanner'
import CodeReviewer from './components/CodeReviewer'
import CodeRefactorer from './components/CodeRefactorer'
import TestGenerator from './components/TestGenerator'
import PerformanceOptimizer from './components/PerformanceOptimizer'
import DocumentationGenerator from './components/DocumentationGenerator'
import SemanticSearch from './components/SemanticSearch'
import AuthModal from './components/AuthModal'
import { useAuth } from './contexts/AuthContext'
import './index.css'

type Tab = 'generate' | 'debug' | 'security' | 'search' | 'review' | 'refactor' | 'test' | 'optimize' | 'docs'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('generate')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user, logout, isAuthenticated, isLoading } = useAuth()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mb-4"></div>
          <p className="text-slate-300 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  // Show welcome page if not authenticated
  if (!isAuthenticated) {
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
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                <FaUser />
                <span>Sign In / Register</span>
              </button>
            </div>
          </div>
        </header>

        {/* Welcome Content */}
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 gradient-text">
              Your AI-Powered Coding Partner
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Supercharge your development workflow with advanced AI features powered by Google Gemini
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center space-x-2"
            >
              <span>Get Started Free</span>
              <FaUser />
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="card hover:border-primary-500/50 transition-all">
              <FaCode className="text-4xl text-primary-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Code Generation</h3>
              <p className="text-slate-400">Generate clean, efficient code from natural language descriptions</p>
            </div>
            
            <div className="card hover:border-primary-500/50 transition-all">
              <FaCheckCircle className="text-4xl text-green-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Code Review</h3>
              <p className="text-slate-400">Get AI-powered code reviews with quality scores and best practices</p>
            </div>
            
            <div className="card hover:border-primary-500/50 transition-all">
              <FaBug className="text-4xl text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Debug Assistant</h3>
              <p className="text-slate-400">Identify bugs and get intelligent suggestions to fix them</p>
            </div>
            
            <div className="card hover:border-primary-500/50 transition-all">
              <FaShieldAlt className="text-4xl text-red-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Security Scanner</h3>
              <p className="text-slate-400">Detect vulnerabilities and security issues in your code</p>
            </div>
            
            <div className="card hover:border-primary-500/50 transition-all">
              <FaExchangeAlt className="text-4xl text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Code Refactoring</h3>
              <p className="text-slate-400">Automatically refactor code for better quality and maintainability</p>
            </div>
            
            <div className="card hover:border-primary-500/50 transition-all">
              <FaFlask className="text-4xl text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Test Generation</h3>
              <p className="text-slate-400">Generate comprehensive unit tests automatically</p>
            </div>
            
            <div className="card hover:border-primary-500/50 transition-all">
              <FaRocket className="text-4xl text-orange-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Performance Optimizer</h3>
              <p className="text-slate-400">Analyze and optimize code for better performance</p>
            </div>
            
            <div className="card hover:border-primary-500/50 transition-all">
              <FaBook className="text-4xl text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Documentation</h3>
              <p className="text-slate-400">Generate professional documentation in multiple formats</p>
            </div>
            
            <div className="card hover:border-primary-500/50 transition-all">
              <FaSearch className="text-4xl text-pink-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Semantic Search</h3>
              <p className="text-slate-400">Search code snippets using natural language queries</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="card bg-gradient-to-r from-primary-900/30 to-purple-900/30 border-primary-500/50 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">Ready to boost your productivity?</h3>
            <p className="text-slate-300 mb-6 text-lg">
              Join developers worldwide using AI to code faster and smarter
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-lg text-lg font-bold transition-colors"
            >
              Create Free Account
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-slate-800/30 backdrop-blur-sm border-t border-slate-700 mt-auto">
          <div className="container mx-auto px-4 py-6">
            <p className="text-center text-slate-400 text-sm">
              Powered by Google Gemini AI • Smart DevCopilot v1.0.0
            </p>
            <p className="text-center text-slate-500 text-xs mt-2">
              Created by Sachuu_.ags
            </p>
          </div>
        </footer>

        {/* Auth Modal */}
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    )
  }

  // Authenticated view - Main application

  // Authenticated view - Main application
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
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-slate-800/30 backdrop-blur-sm border-b border-slate-700 overflow-x-auto">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 min-w-max">
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex items-center space-x-2 px-4 py-4 font-medium transition-all duration-200 ${
                activeTab === 'generate'
                  ? 'text-primary-400 border-b-2 border-primary-400 bg-slate-800/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <FaCode />
              <span>Generate</span>
            </button>
            <button
              onClick={() => setActiveTab('debug')}
              className={`flex items-center space-x-2 px-4 py-4 font-medium transition-all duration-200 ${
                activeTab === 'debug'
                  ? 'text-primary-400 border-b-2 border-primary-400 bg-slate-800/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <FaBug />
              <span>Debug</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center space-x-2 px-4 py-4 font-medium transition-all duration-200 ${
                activeTab === 'security'
                  ? 'text-primary-400 border-b-2 border-primary-400 bg-slate-800/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <FaShieldAlt />
              <span>Security</span>
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`flex items-center space-x-2 px-4 py-4 font-medium transition-all duration-200 ${
                activeTab === 'review'
                  ? 'text-primary-400 border-b-2 border-primary-400 bg-slate-800/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <FaCheckCircle />
              <span>Review</span>
            </button>
            <button
              onClick={() => setActiveTab('refactor')}
              className={`flex items-center space-x-2 px-4 py-4 font-medium transition-all duration-200 ${
                activeTab === 'refactor'
                  ? 'text-primary-400 border-b-2 border-primary-400 bg-slate-800/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <FaExchangeAlt />
              <span>Refactor</span>
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`flex items-center space-x-2 px-4 py-4 font-medium transition-all duration-200 ${
                activeTab === 'test'
                  ? 'text-primary-400 border-b-2 border-primary-400 bg-slate-800/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <FaFlask />
              <span>Tests</span>
            </button>
            <button
              onClick={() => setActiveTab('optimize')}
              className={`flex items-center space-x-2 px-4 py-4 font-medium transition-all duration-200 ${
                activeTab === 'optimize'
                  ? 'text-primary-400 border-b-2 border-primary-400 bg-slate-800/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <FaRocket />
              <span>Optimize</span>
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`flex items-center space-x-2 px-4 py-4 font-medium transition-all duration-200 ${
                activeTab === 'docs'
                  ? 'text-primary-400 border-b-2 border-primary-400 bg-slate-800/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <FaBook />
              <span>Docs</span>
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center space-x-2 px-4 py-4 font-medium transition-all duration-200 ${
                activeTab === 'search'
                  ? 'text-primary-400 border-b-2 border-primary-400 bg-slate-800/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <FaSearch />
              <span>Search</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'generate' && <CodeGenerator />}
        {activeTab === 'debug' && <DebugAnalyzer />}
        {activeTab === 'security' && <SecurityScanner />}
        {activeTab === 'review' && <CodeReviewer />}
        {activeTab === 'refactor' && <CodeRefactorer />}
        {activeTab === 'test' && <TestGenerator />}
        {activeTab === 'optimize' && <PerformanceOptimizer />}
        {activeTab === 'docs' && <DocumentationGenerator />}
        {activeTab === 'search' && <SemanticSearch />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800/30 backdrop-blur-sm border-t border-slate-700 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-slate-400 text-sm">
            Powered by Google Gemini AI • Smart DevCopilot v1.0.0 • Logged in as {user?.username}
          </p>
          <p className="text-center text-slate-500 text-xs mt-2">
            Created by Sachuu_.ags
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
