import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

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
    const formData = new FormData();
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

  async getStatus(): Promise<any> {
    const response = await this.axiosInstance.get('/');
    return response.data;
  }
}

export default new ApiService();
