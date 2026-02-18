import { useState } from 'react'
import { FaUser, FaLock, FaEnvelope, FaUserPlus, FaSignInAlt } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'

interface AuthModalProps {
  onClose: () => void
}

function AuthModal({ onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { login, register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Additional client-side validation
      if (!isLogin) {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long')
        }
        if (!email.includes('@')) {
          throw new Error('Please enter a valid email address')
        }
        if (username.length < 3) {
          throw new Error('Username must be at least 3 characters long')
        }
      }

      if (isLogin) {
        await login(username, password)
      } else {
        await register(username, email, password, fullName || undefined)
      }
      onClose()
    } catch (err: any) {
      console.error('Auth error:', err)
      // Extract user-friendly error message
      let errorMessage = err.message || 'An error occurred'
      
      // Handle common errors
      if (errorMessage.includes('already registered')) {
        errorMessage = '⚠️ This username or email is already taken. Please try another.'
      } else if (errorMessage.includes('network') || errorMessage.includes('Network')) {
        errorMessage = '🌐 Network error. Please check your internet connection and try again.'
      } else if (errorMessage.includes('timeout')) {
        errorMessage = '⏱️ Request timed out. Please check your connection and try again.'
      } else if (errorMessage.includes('Incorrect username or password')) {
        errorMessage = '❌ Incorrect username or password. Please try again.'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-slate-800 rounded-lg p-6 md:p-8 max-w-md w-full border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-2xl z-10"
          type="button"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-2">
            {isLogin ? 'Welcome Back!' : 'Join Smart DevCopilot'}
          </h2>
          <p className="text-slate-400 text-xs md:text-sm">
            {isLogin 
              ? 'Sign in to access your AI coding assistant' 
              : 'Create an account to get started with AI-powered development'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-slate-300 mb-2">
              Username
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field pl-10 text-base"
                placeholder="Enter username"
                required
                minLength={3}
                autoComplete="username"
                autoCapitalize="none"
              />
            </div>
          </div>

          {/* Email (Register only) */}
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs md:text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10 text-base"
                    placeholder="Enter email"
                    required
                    autoComplete="email"
                    autoCapitalize="none"
                    inputMode="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-slate-300 mb-2">
                  Full Name (Optional)
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field pl-10 text-base"
                    placeholder="Enter full name"
                    autoComplete="name"
                  />
                </div>
              </div>
            </>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-slate-300 mb-2">
              Password {!isLogin && <span className="text-slate-500">(min. 6 characters)</span>}
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 text-base"
                placeholder="Enter password"
                required
                minLength={6}
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
              </>
            ) : (
              <>
                {isLogin ? <FaSignInAlt /> : <FaUserPlus />}
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError(null)
              setUsername('')
              setEmail('')
              setPassword('')
              setFullName('')
            }}
            className="text-primary-400 hover:text-primary-300 text-sm"
            type="button"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>

        {/* Info Section */}
        {!isLogin && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-400 text-center">
              🚀 Get instant access to 9 AI-powered features: Code Generation, Review, Debug, Security, Refactoring, Testing, Optimization, Documentation & Search!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthModal
