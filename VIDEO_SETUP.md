# Video Background Setup Guide

## Overview
The application now features an animated video background with particle effects that adapts to all 6 themes.

## Quick Setup

### Option 1: Use Free Stock Videos (Recommended)

1. **Download a free background video** from these sites:
   - [Pexels Videos](https://www.pexels.com/videos/) - Free, no attribution required
   - [Pixabay Videos](https://pixabay.com/videos/) - Free, no attribution required
   - [Coverr](https://coverr.co/) - Free beautiful videos

2. **Recommended video searches:**
   - "coding animation"
   - "programming background"
   - "abstract technology"
   - "digital particles"
   - "matrix code"
   - "data flow"
   - "cyber background"
   - "neon technology"

3. **Download the video** and rename it to `coding-background.mp4`

4. **Convert to WebM** (optional, for better browser support):
   ```bash
   # Using ffmpeg (install from https://ffmpeg.org/)
   ffmpeg -i coding-background.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 coding-background.webm
   ```

5. **Place files** in `frontend/public/videos/` directory:
   ```
   frontend/public/videos/
   ├── coding-background.mp4
   └── coding-background.webm (optional)
   ```

6. **Refresh browser** - video will auto-play in background

### Option 2: Disable Video (Use Particles Only)

If you prefer the particle animation without video:

1. Edit `frontend/src/components/BackgroundVideo.tsx`
2. Comment out the `<video>` element (lines 13-22)
3. Keep the particle effects

### Option 3: Use YouTube/Vimeo Embed

Replace the video element with an iframe:

```tsx
<iframe
  src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=1&loop=1&controls=0&playlist=VIDEO_ID"
  className="absolute inset-0 w-full h-full object-cover"
  allow="autoplay; encrypted-media"
  frameBorder="0"
/>
```

## Features

### 1. Video Background
- Auto-plays on page load
- Loops continuously
- Muted by default (good UX)
- Responsive to all screen sizes
- Theme-aware brightness/saturation filters

### 2. Particle Animation
- 20 animated particles floating upward
- Color matches theme accent
- Randomized positions and timing
- CSS-based (no JavaScript overhead)

### 3. Theme Integration
- **Light themes**: Brighter video, higher opacity overlay
- **Dark themes**: Darker video, lower opacity overlay
- Smooth transitions when switching themes
- Maintains text readability across all themes

### 4. Performance Optimized
- Video stays at z-index -10 (behind all content)
- Uses `will-change` for smooth animations
- Lightweight particle effects
- No impact on app functionality

## Customization

### Adjust Video Opacity
Edit `BackgroundVideo.tsx`:
```tsx
const overlayOpacity = theme === 'light' ? '0.85' : '0.7'
// Increase values for more opacity (darker overlay)
// Decrease values for less opacity (lighter overlay)
```

### Change Particle Count
Edit `BackgroundVideo.tsx`:
```tsx
{[...Array(20)].map((_, i) => (  // Change 20 to your desired count
```

### Modify Particle Size/Speed
Edit `frontend/src/index.css`:
```css
.particle {
  width: 4px;  /* Change particle size */
  height: 4px;
}

@keyframes float-particle {
  /* Adjust animation duration in BackgroundVideo.tsx */
  /* animationDuration: `${10 + Math.random() * 20}s` */
}
```

### Disable Particle Effects
Remove or comment out the particles section in `BackgroundVideo.tsx`:
```tsx
{/* Animated particles effect (CSS-based) */}
<div className="particles-container absolute inset-0">
  {[...Array(20)].map((_, i) => (
    // ... particle code
  ))}
</div>
```

## Recommended Videos by Theme

### Dark Theme
- Matrix-style falling code
- Neon circuit boards
- Dark abstract particles
- Cyberpunk cityscapes

### Light Theme
- Clean geometric patterns
- Minimal white particles
- Soft gradients
- Abstract paper textures

### Purple Theme
- Purple nebula/space
- Violet particle waves
- Gradient flows (purple/pink)

### Green Theme
- Digital rain (Matrix-style)
- Green code scrolling
- Tech tree animations

### Ocean Theme
- Water waves
- Blue particle flows
- Underwater bubbles
- Digital ocean

### Sunset Theme
- Warm gradient animations
- Fire particles
- Sunset time-lapses
- Orange/gold flows

## Example Video Sources

### Pexels Recommendations:
1. **Coding Animation**: https://www.pexels.com/search/videos/coding/
2. **Technology Background**: https://www.pexels.com/search/videos/technology%20background/
3. **Abstract Particles**: https://www.pexels.com/search/videos/abstract%20particles/

### Direct Video IDs (Examples):
- Pexels Video 3129671 - Digital particle waves
- Pexels Video 2278095 - Coding screen
- Pexels Video 8720592 - Abstract tech background

## Troubleshooting

### Video Not Playing
1. **Check file path**: Video must be in `frontend/public/videos/`
2. **Check file name**: Must be `coding-background.mp4` or `.webm`
3. **Browser autoplay**: Some browsers block autoplay. Muted videos usually work.
4. **Console errors**: Check browser console (F12) for errors

### Video Causes Lag
1. **Reduce video file size**: Use lower resolution or compress
2. **Use shorter video**: 10-15 seconds is ideal for loops
3. **Disable particles**: Comment out particle animation code
4. **Lower FPS**: Re-encode video at 24fps instead of 60fps

### Video Too Bright/Dark
Adjust overlay opacity in `BackgroundVideo.tsx`:
```tsx
const overlayOpacity = theme === 'light' ? '0.90' : '0.80' // Darker
const overlayOpacity = theme === 'light' ? '0.70' : '0.50' // Lighter
```

### Text Hard to Read
- Increase overlay opacity (makes background darker)
- Add text shadows in relevant components
- Use different video with less motion
- Disable video, use particles only

## Performance Tips

1. **Optimize video file**:
   ```bash
   # Compress MP4
   ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -preset fast coding-background.mp4
   ```

2. **Use CDN for hosting**: Upload to Cloudinary, ImageKit, or S3 for faster loading

3. **Lazy load video**: Add `loading="lazy"` attribute (modern browsers)

4. **Fallback image**: Add poster image for slow connections:
   ```tsx
   <video poster="/images/video-poster.jpg" ...>
   ```

## Browser Support
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support (iOS requires playsInline)
- ✅ Opera: Full support
- ⚠️ IE11: No support (fallback to solid background)

## File Structure
```
frontend/
├── public/
│   └── videos/
│       ├── coding-background.mp4    (your video file)
│       └── coding-background.webm   (optional, better compression)
├── src/
│   ├── components/
│   │   └── BackgroundVideo.tsx      (background component)
│   ├── index.css                    (animation styles)
│   └── App.tsx                      (integrates background)
```

## Next Steps
1. Download a video from Pexels/Pixabay
2. Place it in `frontend/public/videos/` as `coding-background.mp4`
3. Refresh your browser
4. Enjoy your animated background!

## Support
If you prefer no video background, simply delete or rename the video files and the app will show the gradient background with particle effects only.
