import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface CodeGenerationRequest {
  prompt: string;
  language: string;
  max_tokens?: number;
}

export interface CodeGenerationResponse {
  code: string;
  explanation: string;
  language: string;
  timestamp: string;
}

export interface DebugRequest {
  code: string;
  error_message?: string;
  language: string;
}

export interface DebugResponse {
  analysis: string;
  suggestions: string[];
  fixed_code?: string;
  severity: string;
}

export interface SecurityScanRequest {
  code: string;
  language: string;
}

export interface SecurityIssue {
  type: string;
  severity: string;
  line: number;
  description: string;
  recommendation: string;
}

export interface SecurityScanResponse {
  issues: SecurityIssue[];
  overall_risk: string;
  recommendations: string[];
}

export interface SemanticSearchRequest {
  query: string;
  limit?: number;
}

class ApiService {
  private axiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 second timeout for mobile networks
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.axiosInstance.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });

    // Add response interceptor for better error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout. Please check your connection and try again.');
        }
        if (!error.response) {
          throw new Error('Network error. Please check your internet connection.');
        }
        throw error;
      }
    );
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  // Authentication methods
  async register(username: string, email: string, password: string, fullName?: string) {
    const response = await this.axiosInstance.post('/api/auth/register', {
      username,
      email,
      password,
      full_name: fullName
    });
    return response.data;
  }

  async login(username: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await this.axiosInstance.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.axiosInstance.get('/api/auth/me');
    return response.data;
  }

  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
    const response = await this.axiosInstance.post<CodeGenerationResponse>(
      '/api/generate',
      request
    );
    return response.data;
  }

  async debugCode(request: DebugRequest): Promise<DebugResponse> {
    const response = await this.axiosInstance.post<DebugResponse>(
      '/api/debug',
      request
    );
    return response.data;
  }

  async scanSecurity(request: SecurityScanRequest): Promise<SecurityScanResponse> {
    const response = await this.axiosInstance.post<SecurityScanResponse>(
      '/api/security-scan',
      request
    );
    return response.data;
  }

  async semanticSearch(request: SemanticSearchRequest): Promise<any> {
    const response = await this.axiosInstance.post(
      '/api/semantic-search',
      request
    );
    return response.data;
  }

  async reviewCode(code: string, language: string, context?: string): Promise<any> {
    const response = await this.axiosInstance.post('/api/review', {
      code,
      language,
      context
    });
    return response.data;
  }

  async refactorCode(code: string, language: string, refactor_type: string = 'general'): Promise<any> {
    const response = await this.axiosInstance.post('/api/refactor', {
      code,
      language,
      refactor_type
    });
    return response.data;
  }

  async generateTests(code: string, language: string, test_framework?: string): Promise<any> {
    const response = await this.axiosInstance.post('/api/generate-tests', {
      code,
      language,
      test_framework
    });
    return response.data;
  }

  async optimizeCode(code: string, language: string, context?: string): Promise<any> {
    const response = await this.axiosInstance.post('/api/optimize', {
      code,
      language,
      context
    });
    return response.data;
  }

  async generateDocumentation(code: string, language: string, doc_type: string = 'comprehensive'): Promise<any> {
    const response = await this.axiosInstance.post('/api/generate-docs', {
      code,
      language,
      doc_type
    });
    return response.data;
  }

  async chatWithAssistant(message: string, context?: any, conversation_id?: string): Promise<any> {
    const response = await this.axiosInstance.post('/api/chat', {
      message,
      context,
      conversation_id
    });
    return response.data;
  }

  async clearChatHistory(): Promise<any> {
    const response = await this.axiosInstance.post('/api/chat/clear');
    return response.data;
  }

  async getStatus(): Promise<any> {
    const response = await this.axiosInstance.get('/');
    return response.data;
  }
}

const apiService = new ApiService();

export default apiService;

// Export individual methods as bound functions for easier importing
export const register = apiService.register.bind(apiService);
export const login = apiService.login.bind(apiService);
export const getCurrentUser = apiService.getCurrentUser.bind(apiService);
export const generateCode = apiService.generateCode.bind(apiService);
export const debugCode = apiService.debugCode.bind(apiService);
export const scanSecurity = apiService.scanSecurity.bind(apiService);
export const semanticSearch = apiService.semanticSearch.bind(apiService);
export const reviewCode = apiService.reviewCode.bind(apiService);
export const refactorCode = apiService.refactorCode.bind(apiService);
export const generateTests = apiService.generateTests.bind(apiService);
export const optimizeCode = apiService.optimizeCode.bind(apiService);
export const generateDocumentation = apiService.generateDocumentation.bind(apiService);
export const chatWithAssistant = apiService.chatWithAssistant.bind(apiService);
export const clearChatHistory = apiService.clearChatHistory.bind(apiService);
export const getStatus = apiService.getStatus.bind(apiService);
export const setAuthToken = apiService.setAuthToken.bind(apiService);

