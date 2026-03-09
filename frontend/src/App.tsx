import { useState } from 'react'
import { 
  FaCode, FaBug, FaShieldAlt, FaSearch,
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
import './index.css'

type Tab = 'generate' | 'debug' | 'security' | 'search' | 'review' | 'refactor' | 'test' | 'optimize' | 'docs'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('generate')

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
            Powered by Google Gemini AI • Smart DevCopilot v1.0.0
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
