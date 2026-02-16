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

The frontend connects to the backend API at `http://localhost:8000` by default. This is configured in `vite.config.ts`:

```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    }
  }
}
```

To change the backend URL, modify the `API_BASE_URL` in `src/services/api.ts`.

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
