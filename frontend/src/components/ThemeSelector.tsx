import { FaPalette } from 'react-icons/fa'
import { useTheme, Theme } from '../contexts/ThemeContext'

const themes: { value: Theme; label: string; colors: string[] }[] = [
  { value: 'dark', label: 'Dark', colors: ['#0f172a', '#06b6d4', '#3b82f6'] },
  { value: 'light', label: 'Light', colors: ['#f8fafc', '#0891b2', '#2563eb'] },
  { value: 'purple', label: 'Purple', colors: ['#1e1b4b', '#a78bfa', '#c084fc'] },
  { value: 'green', label: 'Green', colors: ['#022c22', '#10b981', '#34d399'] },
  { value: 'ocean', label: 'Ocean', colors: ['#082f49', '#0ea5e9', '#06b6d4'] },
  { value: 'sunset', label: 'Sunset', colors: ['#431407', '#f97316', '#fb923c'] },
]

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-slate-700/50">
        <FaPalette className="text-lg" />
        <span className="text-sm hidden md:inline">Theme</span>
      </button>
      
      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
           style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div className="p-2">
          <div className="text-xs font-semibold mb-2 px-2" style={{ color: 'var(--text-secondary)' }}>
            Select Theme
          </div>
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors duration-200 ${
                theme === t.value ? 'ring-2' : 'hover:bg-slate-700/50'
              }`}
              style={{
                backgroundColor: theme === t.value ? 'var(--bg-tertiary)' : 'transparent',
                borderColor: theme === t.value ? 'var(--accent-2)' : 'transparent'
              }}
            >
              <span className="text-sm">{t.label}</span>
              <div className="flex space-x-1">
                {t.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
