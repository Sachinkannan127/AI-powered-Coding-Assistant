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
import ThemeSelector from './components/ThemeSelector'
import BackgroundVideo from './components/BackgroundVideo'
import './index.css'

type Tab = 'generate' | 'debug' | 'security' | 'search' | 'review' | 'refactor' | 'test' | 'optimize' | 'docs'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('generate')

  return (
    <div className="min-h-screen relative" style={{ background: `linear-gradient(to bottom right, var(--bg-primary), var(--bg-secondary), var(--bg-primary))` }}>
      {/* Background Video Animation */}
      <BackgroundVideo />
      
      {/* Header */}
      <header style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Smart DevCopilot</h1>
              <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>AI-Powered Coding Assistant</p>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeSelector />
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid var(--border-color)' }} className="overflow-x-auto">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 min-w-max">
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex items-center space-x-2 px-4 py-4 font-medium transition-all duration-200 ${
                activeTab === 'generate'
                  ? 'border-b-2'
                  : ''
              }`}
              style={{
                color: activeTab === 'generate' ? 'var(--accent-2)' : 'var(--text-secondary)',
                borderColor: activeTab === 'generate' ? 'var(--accent-2)' : 'transparent',
                backgroundColor: activeTab === 'generate' ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
              }}
            >
              <FaCode />
              <span>Generate</span>
            </button>
            <button
              onClick={() => setActiveTab('debug')}
              className={`flex items-center space-x-2 px-4 py-4 font-medium transition-all duration-200 ${
                activeTab === 'debug'
                  ? 'border-b-2'
                  : ''
              }`}
              style={{
                color: activeTab === 'debug' ? 'var(--accent-2)' : 'var(--text-secondary)',
                borderColor: activeTab === 'debug' ? 'var(--accent-2)' : 'transparent',
                backgroundColor: activeTab === 'debug' ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
              }}
            >
              <FaBug />
              <span>Debug</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center space-x-2 px-4 py-4 font-medium transition-all duration-200 ${
                activeTab === 'security'
                  ? 'border-b-2'
                  : ''
              }`}
              style={{
                color: activeTab === 'security' ? 'var(--accent-2)' : 'var(--text-secondary)',
                borderColor: activeTab === 'security' ? 'var(--accent-2)' : 'transparent',
                backgroundColor: activeTab === 'security' ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
              }}
            >
              <FaShieldAlt />
              <span>Security</span>
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`flex items-center space-x-2 px-4 py-4 font-medium transition-all duration-200 ${
                activeTab === 'review'
                  ? 'border-b-2'
                  : ''
              }`}
              style={{
                color: activeTab === 'review' ? 'var(--accent-2)' : 'var(--text-secondary)',
                borderColor: activeTab === 'review' ? 'var(--accent-2)' : 'transparent',
                backgroundColor: activeTab === 'review' ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
              }}
            >
              <FaCheckCircle />
              <span>Review</span>
            </button>
            <button
              onClick={() => setActiveTab('refactor')}
              className={`flex items-center space-x-2 px-4 py-4 font-medium transition-all duration-200 ${
                activeTab === 'refactor'
                  ? 'border-b-2'
                  : ''
              }`}
              style={{
                color: activeTab === 'refactor' ? 'var(--accent-2)' : 'var(--text-secondary)',
                borderColor: activeTab === 'refactor' ? 'var(--accent-2)' : 'transparent',
                backgroundColor: activeTab === 'refactor' ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
              }}
            >
              <FaExchangeAlt />
              <span>Refactor</span>
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`flex items-center space-x-2 px-4 py-4 font-medium transition-all duration-200 ${
                activeTab === 'test'
                  ? 'border-b-2'
                  : ''
              }`}
              style={{
                color: activeTab === 'test' ? 'var(--accent-2)' : 'var(--text-secondary)',
                borderColor: activeTab === 'test' ? 'var(--accent-2)' : 'transparent',
                backgroundColor: activeTab === 'test' ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
              }}
            >
              <FaFlask />
              <span>Tests</span>
            </button>
            <button
              onClick={() => setActiveTab('optimize')}
              className={`flex items-center space-x-2 px-4 py-4 font-medium transition-all duration-200 ${
                activeTab === 'optimize'
                  ? 'border-b-2'
                  : ''
              }`}
              style={{
                color: activeTab === 'optimize' ? 'var(--accent-2)' : 'var(--text-secondary)',
                borderColor: activeTab === 'optimize' ? 'var(--accent-2)' : 'transparent',
                backgroundColor: activeTab === 'optimize' ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
              }}
            >
              <FaRocket />
              <span>Optimize</span>
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`flex items-center space-x-2 px-4 py-4 font-medium transition-all duration-200 ${
                activeTab === 'docs'
                  ? 'border-b-2'
                  : ''
              }`}
              style={{
                color: activeTab === 'docs' ? 'var(--accent-2)' : 'var(--text-secondary)',
                borderColor: activeTab === 'docs' ? 'var(--accent-2)' : 'transparent',
                backgroundColor: activeTab === 'docs' ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
              }}
            >
              <FaBook />
              <span>Docs</span>
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center space-x-2 px-4 py-4 font-medium transition-all duration-200 ${
                activeTab === 'search'
                  ? 'border-b-2'
                  : ''
              }`}
              style={{
                color: activeTab === 'search' ? 'var(--accent-2)' : 'var(--text-secondary)',
                borderColor: activeTab === 'search' ? 'var(--accent-2)' : 'transparent',
                backgroundColor: activeTab === 'search' ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
              }}
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
      <footer style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderTop: '1px solid var(--border-color)' }} className="mt-auto">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Powered by Groq AI • Smart DevCopilot v1.0.0
          </p>
          <p className="text-center text-xs mt-2" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
            Created by Sachuu_.ags
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
