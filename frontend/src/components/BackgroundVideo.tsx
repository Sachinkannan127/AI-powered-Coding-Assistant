import { useTheme } from '../contexts/ThemeContext'

export default function BackgroundVideo() {
  const { theme } = useTheme()

  // Opacity varies by theme for better readability
  const overlayOpacity = theme === 'light' ? '0.85' : '0.7'

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-10">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: theme === 'light' ? 'brightness(1.2) saturate(0.8)' : 'brightness(0.7) saturate(1.2)'
        }}
      >
        {/* Multiple sources for browser compatibility */}
        <source src="/videos/coding-background.mp4" type="video/mp4" />
        <source src="/videos/coding-background.webm" type="video/webm" />
        
        {/* Fallback for browsers that don't support video */}
        Your browser does not support the video tag.
      </video>

      {/* Themed overlay for readability */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundColor: 'var(--bg-primary)',
          opacity: overlayOpacity,
          mixBlendMode: theme === 'light' ? 'normal' : 'multiply'
        }}
      />

      {/* Gradient overlay for depth */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: `radial-gradient(circle at center, transparent 0%, var(--bg-primary) 100%)`
        }}
      />

      {/* Animated particles effect (CSS-based) */}
      <div className="particles-container absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 20}s`
            }}
          />
        ))}
      </div>
    </div>
  )
}
