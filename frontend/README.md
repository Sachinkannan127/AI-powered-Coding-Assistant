# Smart DevCopilot - Frontend

Modern web interface for the AI-Powered Coding Assistant.

## Features

- **Code Generator**: Generate code from natural language descriptions
- **Debug Analyzer**: Analyze code issues and get intelligent debugging suggestions  
- **Security Scanner**: Scan code for security vulnerabilities and get remediation recommendations
- **Semantic Search**: Search through codebases using natural language (requires backend setup)

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Syntax Highlighter** for code display

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend server running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

## Configuration

### Environment Variables

Create a `.env` file in the frontend directory (use `.env.example` as template):

```bash
# Copy example file
cp .env.example .env
```

**Environment Variables:**
- `VITE_API_BASE_URL` - Backend API URL (default: `http://localhost:8000`)

**Development:**
```env
VITE_API_BASE_URL=http://localhost:8000
```

**Production (.env.production):**
```env
VITE_API_BASE_URL=https://your-backend-api.com
```

The frontend connects to the backend API using the environment variable. This is configured in `src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

### Vite Proxy (Development Only)

For local development, Vite proxy is configured in `vite.config.ts`:

```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    }
  }
```
}
```

## Deployment

### Deploy to Vercel

**Option 1: Via Vercel Dashboard**

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **"Add New Project"**
4. Import your repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://your-backend-api.com`
7. Click **Deploy**

**Option 2: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend folder
cd frontend

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# Deploy to production
vercel --prod
```

**Important:** Update the `.env.production` file with your production backend URL before deploying.

### Other Platforms

The app can be deployed to any static hosting platform:
- **Netlify**: Drag & drop `dist` folder or connect Git
- **GitHub Pages**: Use `vite-plugin-pages`
- **AWS S3 + CloudFront**: Upload `dist` folder
- **Firebase Hosting**: Use Firebase CLI

Always set `VITE_API_BASE_URL` environment variable to your production backend URL.

## Usage

### Code Generation
1. Select your programming language
2. Enter a natural language description of what you want to build
3. Click "Generate Code"
4. Review the generated code and explanation

### Debug Analysis
1. Select your programming language
2. Optionally enter an error message
3. Paste the code you want to debug
4. Click "Analyze Code"
5. Review the analysis, suggestions, and fixed code

### Security Scanning
1. Select your programming language
2. Paste the code you want to scan
3. Click "Scan for Vulnerabilities"
4. Review detected issues and recommendations

## Components

- **App.tsx**: Main application component with tab navigation
- **CodeGenerator.tsx**: Code generation interface
- **DebugAnalyzer.tsx**: Debugging analysis interface
- **SecurityScanner.tsx**: Security scanning interface
- **api.ts**: API service layer for backend communication

## Styling

The app uses Tailwind CSS with a dark theme optimized for code viewing. Custom styles are defined in:
- `index.css`: Global styles and utility classes
- `tailwind.config.js`: Tailwind configuration

## License

MIT License - see LICENSE file for details
