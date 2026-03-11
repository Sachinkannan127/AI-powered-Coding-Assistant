"""
AI Engine - Core AI/ML functionality for code generation, debugging, and security
Integrates with Groq and OpenAI APIs for AI-powered features
"""

import os
from typing import Dict, List, Optional, Any
import asyncio
import httpx
import json
from datetime import datetime

POE_AVAILABLE = True  # Using httpx for direct API calls


async def call_ai_api(api_key: str, bot_name: str, prompt: str, api_type: str = "auto") -> str:
    """
    Call AI API (Groq or OpenAI) to get AI-powered responses
    
    Args:
        api_key: API key for the selected service (not used in auto mode)
        bot_name: Bot/model identifier (legacy parameter, not used)
        prompt: The prompt to send to the AI
        api_type: API type ("openai", "groq", or "auto" to detect)
        
    Returns:
        AI-generated response text
    """
    # Auto-detect API type based on key format or try multiple services
    if api_type == "auto":
        # Try Groq first (fast and free)
        groq_key = os.getenv("GROQ_API_KEY")
        if groq_key and groq_key != "your-groq-api-key-here":
            result = await call_groq_api(groq_key, prompt)
            if not result.startswith("Error:"):
                return result
        
        # Try OpenAI second
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key and openai_key != "your-openai-api-key-here":
            result = await call_openai_api(openai_key, prompt)
            if not result.startswith("Error:"):
                return result
        
        return """Error: No AI API configured!

Please set ONE of these in your .env file:
1. GROQ_API_KEY (from https://console.groq.com/keys) - FREE
2. OPENAI_API_KEY (from https://platform.openai.com/api-keys)

Example .env file:
GROQ_API_KEY=gsk_...

Then restart the backend server."""
    elif api_type == "openai":
        return await call_openai_api(api_key, prompt)
    elif api_type == "groq":
        return await call_groq_api(api_key, prompt)
    else:
        return "Error: Unsupported API type. Use 'groq' or 'openai'."


async def call_openai_api(api_key: str, prompt: str) -> str:
    """
    Call OpenAI API (GPT-4, GPT-3.5-turbo, etc.)
    """
    try:
        api_url = "https://api.openai.com/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "gpt-4o-mini",  # Fast and cost-effective
            "messages": [
                {"role": "system", "content": "You are an expert AI coding assistant. Provide accurate, well-formatted code with clear explanations."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(api_url, json=payload, headers=headers)
            
            if response.status_code == 401:
                return "Error: Invalid OPENAI_API_KEY. Get your key from https://platform.openai.com/api-keys"
            elif response.status_code == 429:
                return "Error: OpenAI rate limit exceeded. Please wait or check your billing."
            elif response.status_code >= 400:
                return f"Error: OpenAI API error {response.status_code}"
            
            result = response.json()
            return result["choices"][0]["message"]["content"]
            
    except Exception as e:
        return f"Error: OpenAI API failed - {str(e)}"


async def call_groq_api(api_key: str, prompt: str) -> str:
    """
    Call Groq API (Fast, free inference with Llama, Mixtral, etc.)
    """
    try:
        api_url = "https://api.groq.com/openai/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "llama-3.3-70b-versatile",  # Fast and capable
            "messages": [
                {"role": "system", "content": "You are an expert AI coding assistant. Provide accurate, well-formatted code with clear explanations."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(api_url, json=payload, headers=headers)
            
            if response.status_code == 401:
                return "Error: Invalid GROQ_API_KEY. Get your free key from https://console.groq.com/keys"
            elif response.status_code == 429:
                return "Error: Groq rate limit exceeded. Please wait a moment."
            elif response.status_code >= 400:
                return f"Error: Groq API error {response.status_code}"
            
            result = response.json()
            return result["choices"][0]["message"]["content"]
            
    except Exception as e:
        return f"Error: Groq API failed - {str(e)}"


async def call_poe_api(poe_api_key: str, bot_name: str, prompt: str) -> str:
    """
    Call Poe API using the correct SSE streaming protocol.
    
    Poe API docs: https://creator.poe.com/docs/accessing-other-bots-on-poe
    - Endpoint: POST https://api.poe.com/bot/{bot_name}
    - Auth: Authorization header WITHOUT "Bearer" prefix
    - Response: Server-Sent Events (SSE) stream
    """
    try:
        # Correct Poe API endpoint - bot name goes in the URL path
        api_url = f"https://api.poe.com/bot/{bot_name}"
        
        ts = int(datetime.now().timestamp() * 1000)
        
        headers = {
            "Authorization": poe_api_key,   # NO "Bearer" prefix for Poe
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
        }
        
        # Poe protocol message format
        payload = {
            "version": "1.0",
            "type": "query",
            "query": [
                {
                    "role": "user",
                    "content": prompt,
                    "content_type": "text/plain",
                    "timestamp": ts,
                    "message_id": f"msg-{ts}"
                }
            ],
            "user_id": "",
            "conversation_id": f"conv-{ts}",
            "message_id": f"req-{ts}"
        }
        
        full_text = ""
        
        # Stream SSE response
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream("POST", api_url, json=payload, headers=headers) as response:
                if response.status_code == 401:
                    return "Error: Invalid POE_API_KEY. Get your key from https://poe.com/api_key"
                elif response.status_code == 403:
                    return "Error: Poe access denied. Check your API key permissions at https://poe.com/api_key"
                elif response.status_code == 404:
                    # Try fallback bot name
                    return await _call_poe_fallback(poe_api_key, prompt)
                elif response.status_code == 429:
                    return "Error: Poe rate limit exceeded. Please wait a moment and try again."
                elif response.status_code >= 400:
                    body = await response.aread()
                    detail = body.decode()[:200] if body else "Unknown error"
                    return f"Error: Poe API error {response.status_code}: {detail}"
                
                # Parse SSE events line by line
                async for line in response.aiter_lines():
                    line = line.strip()
                    if not line or not line.startswith("data: "):
                        continue
                    
                    data_str = line[6:]   # Strip "data: " prefix
                    if data_str in ("[DONE]", "{}"):
                        continue
                    
                    try:
                        data = json.loads(data_str)
                        event = data.get("event", "")
                        
                        if event == "text":
                            # Append streamed text chunk
                            text_data = data.get("data", {})
                            if isinstance(text_data, dict):
                                full_text += text_data.get("text", "")
                            elif isinstance(text_data, str):
                                full_text += text_data
                        elif event == "replace_response":
                            text_data = data.get("data", {})
                            if isinstance(text_data, dict):
                                full_text = text_data.get("text", full_text)
                        elif event == "done":
                            break
                        elif event == "error":
                            err_data = data.get("data", {})
                            err_msg = err_data.get("text", str(err_data)) if isinstance(err_data, dict) else str(err_data)
                            return f"Error: Poe bot error - {err_msg}"
                    except json.JSONDecodeError:
                        # Some lines may be plain text
                        if data_str and data_str != "[DONE]":
                            full_text += data_str
        
        return full_text if full_text else "Error: Empty response from Poe API. Try a different bot or check your API key."
        
    except httpx.TimeoutException:
        return "Error: Poe API timed out (>120s). Please try again."
    except httpx.ConnectError:
        return "Error: Cannot connect to Poe API. Check your internet connection."
    except httpx.RequestError as e:
        return f"Error: Network error calling Poe API - {str(e)}"
    except Exception as e:
        return f"Error: Unexpected Poe API error - {type(e).__name__}: {str(e)}"


async def _call_poe_fallback(poe_api_key: str, prompt: str) -> str:
    """Try common Poe bot names as fallbacks when the primary bot 404s."""
    fallback_bots = ["Claude-3-Sonnet", "Claude-3-Haiku", "GPT-3.5-Turbo", "Llama-3-8b-Instruct"]
    for fallback in fallback_bots:
        try:
            ts = int(datetime.now().timestamp() * 1000)
            api_url = f"https://api.poe.com/bot/{fallback}"
            headers = {
                "Authorization": poe_api_key,
                "Content-Type": "application/json",
                "Accept": "text/event-stream",
            }
            payload = {
                "version": "1.0",
                "type": "query",
                "query": [{"role": "user", "content": prompt, "content_type": "text/plain", "timestamp": ts, "message_id": f"msg-{ts}"}],
                "user_id": "",
                "conversation_id": f"conv-{ts}",
                "message_id": f"req-{ts}"
            }
            full_text = ""
            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream("POST", api_url, json=payload, headers=headers) as response:
                    if response.status_code not in (200, 201):
                        continue
                    async for line in response.aiter_lines():
                        line = line.strip()
                        if not line or not line.startswith("data: "):
                            continue
                        data_str = line[6:]
                        if data_str in ("[DONE]", "{}"):
                            continue
                        try:
                            data = json.loads(data_str)
                            event = data.get("event", "")
                            if event == "text":
                                text_data = data.get("data", {})
                                full_text += text_data.get("text", "") if isinstance(text_data, dict) else str(text_data)
                            elif event == "done":
                                break
                        except json.JSONDecodeError:
                            pass
            if full_text:
                return full_text
        except Exception:
            continue
    return "Error: Could not reach any Poe bot. Please verify your POE_API_KEY at https://poe.com/api_key or use OPENAI_API_KEY / GROQ_API_KEY instead."


class CodeGenerator:
    """
    Generate code from natural language using AI models
    """
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")
        
        if self.api_key:
            # Configure Groq/OpenAI API
            self.bot_name = "Claude-3-Opus"  # Poe bot
            pass  # Using Poe API
            print("âœ“ Using Poe API with Claude-3-Opus")
        else:
            print("ERROR: GROQ_API_KEY or OPENAI_API_KEY not configured")
            print("Set GROQ_API_KEY or OPENAI_API_KEY in your .env file")
            pass  # Groq/OpenAI API configured
    
    async def generate(
        self, 
        prompt: str, 
        language: str, 
        context: Optional[str] = None,
        max_tokens: int = 1000
    ) -> Dict[str, Any]:
        """
        Generate code from natural language prompt
        """
        # Simple, direct prompt for brief code generation
        full_prompt = f"""Write {language} code: {prompt}
{f'Context: {context}' if context else ''}

Return: Working code with brief explanation."""
        
        if not self.api_key:
            return {
                "code": "# Error: No AI API configured",
                "explanation": "Please set GROQ_API_KEY or OPENAI_API_KEY in your .env file",
                "optimization_tips": ["Get free Groq API key from https://console.groq.com"],
                "documentation": "Configure AI API to use Smart DevCopilot"
            }
        
        result = await self._generate_with_poe(full_prompt)
        return result
    
    async def _generate_with_poe(self, full_prompt: str) -> Dict[str, Any]:
        """Generate using Poe API via HTTP"""
        
        if not self.api_key:
            return {
                "code": "# Error: No AI API configured",
                "explanation": "Please set GROQ_API_KEY or OPENAI_API_KEY in your .env file",
                "optimization_tips": ["See backend/.env.example for configuration examples"],
                "documentation": "Configure AI API to use Smart DevCopilot"
            }
        
        # Call AI API using helper function
        content = await call_ai_api(self.api_key, self.bot_name, full_prompt)
        
        # Check for errors
        if "Error:" in content or "error" in content.lower():
            return {
                "code": f"# {content}\n\ndef generated_function():\n    \"\"\"API Error\"\"\"\n    pass",
                "explanation": content,
                "optimization_tips": ["Check API key and connection"],
                "documentation": "Error occurred"
            }
        
        # Simple response parsing for brief code-focused output
        import re
        
        # Extract code from markdown code blocks
        code_match = re.search(r'```(?:\w+)?\n(.+?)```', content, re.DOTALL)
        
        if code_match:
            code = code_match.group(1).strip()
            # Get explanation (text before code block, keep it brief)
            explanation = content[:content.find('```')].strip()
            if not explanation:
                # Try text after code block
                explanation = content[content.rfind('```')+3:].strip()
        else:
            # No code block, assume entire response is code
            code = content.strip()
            explanation = "Generated code"
        
        # Extract a brief optimization tip
        tip_match = re.search(r'(?:tip|optimize|improve):\s*(.+?)(?:\n|$)', content, re.IGNORECASE)
        tip = tip_match.group(1).strip() if tip_match else "Review and test thoroughly"
        
        return {
            "code": code[:3000],  # Limit code length
            "explanation": explanation[:400] or "AI-generated code",  # Brief explanation
            "optimization_tips": [tip[:150]],  # Single brief tip
            "documentation": code.split('\n', 1)[0] if code else "Generated code"  # First line as doc
        }
    
    async def _generate_with_local_model(self, system_prompt: str, user_prompt: str, max_tokens: int) -> Dict[str, Any]:
        """Generate using local Hugging Face model"""
        full_prompt = f"{system_prompt}\n\n{user_prompt}"
        
        inputs = self.tokenizer(full_prompt, return_tensors="pt").to(self.model.device)
        
        outputs = await asyncio.to_thread(
            self.model.generate,
            **inputs,
            max_new_tokens=max_tokens,
            temperature=0.2,
            do_sample=True
        )
        
        generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        code = generated_text[len(full_prompt):].strip()
        
        return {
            "code": code,
            "explanation": "Code generated using local AI model.",
            "optimization_tips": ["Review for best practices", "Add error handling"],
            "documentation": self._generate_documentation(code, "Generated code")
        }
    
    def _generate_documentation(self, code: str, explanation: str) -> str:
        """Generate documentation for the code"""
        return f"""
# Generated Code Documentation

## Overview
{explanation}

## Usage
```
{code[:200]}...
```

## Notes
- Review and test before production use
- Customize based on specific requirements
- Add appropriate error handling
"""


class DebugAnalyzer:
    """
    Analyze code and provide debugging suggestions
    """
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")
        
        if self.api_key:
            self.bot_name = "Claude-3-Opus"  # Poe bot
            pass  # Using Groq/OpenAI API
        else:
            pass  # Groq/OpenAI API configured
    
    async def analyze(
        self, 
        code: str, 
        language: str, 
        error_message: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze code for bugs and provide suggestions
        """
        system_prompt = f"""You are an expert debugger for {language}.
Analyze the code and provide:
1. Potential bugs or issues
2. Detailed explanations of problems
3. Fixed version of the code
4. Best practices recommendations
"""
        
        user_prompt = f"Code to debug:\n```{language}\n{code}\n```\n"
        if error_message:
            user_prompt += f"\nError message: {error_message}\n"
        
        user_prompt += "\nProvide debugging analysis and suggestions."
        
        if not self.api_key:
            return {
                "analysis": "Error: No AI API key configured. Please set GROQ_API_KEY or OPENAI_API_KEY in your .env file.",
                "suggestions": ["Set GROQ_API_KEY or OPENAI_API_KEY in .env file", "Get free Groq API key from https://console.groq.com"],
                "fixed_code": None,
                "severity": "high"
            }
        
        full_prompt = f"{system_prompt}\n\n{user_prompt}"
        
        try:
            content = await call_ai_api(self.api_key, self.bot_name, full_prompt)
        except Exception as e:
            content = f"Error calling AI API: {str(e)}"
        
        # Extract fixed code if present
        fixed_code = None
        if "```" in content:
            code_blocks = content.split("```")
            if len(code_blocks) >= 3:
                fixed_code = code_blocks[1].split("\n", 1)[1] if "\n" in code_blocks[1] else code_blocks[1]
        
        # Extract suggestions (look for bullet points or numbered lists)
        suggestions = []
        lines = content.split("\n")
        for line in lines:
            line = line.strip()
            if line.startswith("-") or line.startswith("â€¢") or (len(line) > 0 and line[0].isdigit() and "." in line[:3]):
                suggestions.append(line.lstrip("-â€¢0123456789. "))
        
        # If no suggestions found, create default ones
        if not suggestions:
            suggestions = [
                "Review the analysis above",
                "Test the fixed code thoroughly",
                "Consider edge cases and error handling"
            ]
        
        # Determine severity based on error_message presence and content
        severity = "medium"
        if error_message:
            if any(keyword in error_message.lower() for keyword in ["critical", "fatal", "exception", "error"]):
                severity = "high"
        else:
            severity = "low"
        
        return {
            "analysis": content,
            "suggestions": suggestions[:5],  # Limit to 5 suggestions
            "fixed_code": fixed_code,
            "severity": severity
        }


class SecurityScanner:
    """
    Scan code for security vulnerabilities
    """
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")
        
        if self.api_key:
            self.bot_name = "Claude-3-Opus"  # Poe bot
            pass  # Using Groq/OpenAI API
        else:
            pass  # Groq/OpenAI API configured
        
        # Common vulnerability patterns
        self.vulnerability_patterns = {
            "python": [
                ("eval(", "Code injection risk"),
                ("exec(", "Code execution risk"),
                ("pickle.loads", "Deserialization vulnerability"),
                ("sql = ", "Potential SQL injection"),
            ],
            "javascript": [
                ("eval(", "Code injection risk"),
                ("innerHTML", "XSS vulnerability"),
                ("document.write", "XSS vulnerability"),
                ("dangerouslySetInnerHTML", "XSS risk"),
            ]
        }
    
    async def scan(
        self, 
        code: str, 
        language: str, 
        file_path: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Scan code for security vulnerabilities
        """
        issues = []
        severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
        
        # Pattern-based detection
        if language in self.vulnerability_patterns:
            for pattern, description in self.vulnerability_patterns[language]:
                if pattern in code:
                    issues.append({
                        "type": f"{pattern.strip('(')} Usage Detected",
                        "severity": "high",
                        "line": self._find_line_number(code, pattern),
                        "description": description,
                        "recommendation": f"Avoid using {pattern.strip('(')} or ensure proper input validation and sanitization"
                    })
                    severity_counts["high"] += 1
        
        # AI-based deep analysis
        system_prompt = f"""You are a security expert analyzing {language} code.
Identify security vulnerabilities including:
- SQL injection
- XSS attacks
- CSRF vulnerabilities
- Authentication issues
- Data exposure
- Insecure dependencies
For each issue found, provide: type, severity (critical/high/medium/low), description, and recommendation.
Format as bullet points with clear structure.
"""
        
        user_prompt = f"Analyze this {language} code for security issues:\n```{language}\n{code}\n```"
        
        if self.api_key:
            try:
                full_prompt = f"{system_prompt}\n\n{user_prompt}"
                ai_analysis = await call_ai_api(self.api_key, self.bot_name, full_prompt)
                
                # Parse AI analysis for additional issues
                # Look for severity indicators in the response
                lines = ai_analysis.lower().split('\n')
                for line in lines:
                    if any(word in line for word in ['critical', 'high', 'medium', 'low']):
                        if 'critical' in line:
                            severity_counts['critical'] += 1
                        elif 'high' in line:
                            severity_counts['high'] += 1
                        elif 'medium' in line:
                            severity_counts['medium'] += 1
                        elif 'low' in line:
                            severity_counts['low'] += 1
            except Exception as e:
                ai_analysis = f"AI analysis unavailable: {str(e)}"
        
        # Calculate overall risk
        if severity_counts["critical"] > 0:
            overall_risk = "critical"
        elif severity_counts["high"] > 0:
            overall_risk = "high"
        elif severity_counts["medium"] > 0:
            overall_risk = "medium"
        elif len(issues) > 0:
            overall_risk = "low"
        else:
            overall_risk = "low"
        
        # General recommendations
        recommendations = [
            "Use parameterized queries to prevent SQL injection",
            "Sanitize and validate all user inputs",
            "Implement proper authentication and authorization",
            "Use HTTPS for all communications",
            "Keep dependencies up to date",
            "Follow OWASP security guidelines"
        ]
        
        return {
            "issues": issues,
            "overall_risk": overall_risk,
            "recommendations": recommendations
        }
    
    def _find_line_number(self, code: str, pattern: str) -> int:
        """Find line number of a pattern in code"""
        lines = code.split("\n")
        for i, line in enumerate(lines, 1):
            if pattern in line:
                return i
        return 0


class CodeReviewer:
    """
    AI-powered code review with best practices and suggestions
    """
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")
        
        if self.api_key:
            self.bot_name = "Claude-3-Opus"  # Poe bot
            pass  # Using Groq/OpenAI API
        else:
            pass  # Groq/OpenAI API configured
    
    async def review(self, code: str, language: str, context: Optional[str] = None) -> Dict[str, Any]:
        """Perform comprehensive code review"""
        system_prompt = f"""You are a senior {language} code reviewer.
Perform a thorough code review covering:
1. Code quality and readability
2. Best practices and design patterns
3. Performance considerations
4. Potential bugs or edge cases
5. Security implications
6. Maintainability concerns
7. Testing recommendations

Provide specific, actionable feedback with examples."""

        user_prompt = f"Review this {language} code:\n```{language}\n{code}\n```"
        if context:
            user_prompt += f"\n\nContext: {context}"
        
        if not self.api_key:
            return {
                "overall_score": 0,
                "issues": [],
                "suggestions": ["Configure GROQ_API_KEY or OPENAI_API_KEY to use code review"],
                "strengths": [],
                "improvements": []
            }
        
        try:
            full_prompt = f"{system_prompt}\n\n{user_prompt}"
            content = await call_ai_api(self.api_key, self.bot_name, full_prompt)
            
            # Parse review content
            issues = self._extract_issues(content)
            suggestions = self._extract_suggestions(content)
            strengths = self._extract_strengths(content)
            
            # Calculate score based on issues found
            score = max(0, 100 - len(issues) * 5)
            
            return {
                "overall_score": score,
                "review": content,
                "issues": issues[:10],
                "suggestions": suggestions[:10],
                "strengths": strengths[:5],
                "improvements": self._generate_improvements(content)
            }
        except Exception as e:
            return {
                "overall_score": 50,
                "review": f"Review failed: {str(e)}",
                "issues": [],
                "suggestions": [],
                "strengths": [],
                "improvements": []
            }
    
    def _extract_issues(self, content: str) -> List[str]:
        """Extract issues from review content"""
        issues = []
        lines = content.split('\n')
        for line in lines:
            line_lower = line.lower()
            if any(word in line_lower for word in ['issue', 'problem', 'concern', 'warning', 'error']):
                cleaned = line.strip().lstrip('-â€¢*0123456789. ')
                if cleaned and len(cleaned) > 10:
                    issues.append(cleaned)
        return issues[:10]
    
    def _extract_suggestions(self, content: str) -> List[str]:
        """Extract suggestions from review content"""
        suggestions = []
        lines = content.split('\n')
        for line in lines:
            line_lower = line.lower()
            if any(word in line_lower for word in ['suggest', 'recommend', 'consider', 'should', 'could']):
                cleaned = line.strip().lstrip('-â€¢*0123456789. ')
                if cleaned and len(cleaned) > 10:
                    suggestions.append(cleaned)
        return suggestions[:10]
    
    def _extract_strengths(self, content: str) -> List[str]:
        """Extract strengths from review content"""
        strengths = []
        lines = content.split('\n')
        for line in lines:
            line_lower = line.lower()
            if any(word in line_lower for word in ['good', 'well', 'strength', 'excellent', 'clear']):
                cleaned = line.strip().lstrip('-â€¢*0123456789. ')
                if cleaned and len(cleaned) > 10:
                    strengths.append(cleaned)
        return strengths[:5]
    
    def _generate_improvements(self, content: str) -> List[str]:
        """Generate improvement recommendations"""
        return [
            "Follow SOLID principles",
            "Add comprehensive error handling",
            "Improve code documentation",
            "Consider adding unit tests",
            "Review for performance optimizations"
        ]


class CodeRefactorer:
    """
    AI-powered code refactoring assistant
    """
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")
        
        if self.api_key:
            self.bot_name = "Claude-3-Opus"  # Poe bot
            pass  # Using Groq/OpenAI API
        else:
            pass  # Groq/OpenAI API configured
    
    async def refactor(self, code: str, language: str, refactor_type: str = "general") -> Dict[str, Any]:
        """Refactor code for better quality"""
        refactor_prompts = {
            "general": "Refactor for overall code quality, readability, and maintainability",
            "performance": "Optimize for better performance and efficiency",
            "clean_code": "Apply clean code principles and best practices",
            "design_patterns": "Apply appropriate design patterns",
            "simplify": "Simplify and reduce complexity"
        }
        
        system_prompt = f"""You are an expert {language} developer specializing in code refactoring.
{refactor_prompts.get(refactor_type, refactor_prompts['general'])}

Provide:
1. Refactored code
2. Explanation of changes made
3. Benefits of the refactoring
4. Migration notes if applicable"""

        user_prompt = f"Refactor this {language} code:\n```{language}\n{code}\n```"
        
        if not self.api_key:
            return {
                "refactored_code": code,
                "changes": ["Configure GROQ_API_KEY or OPENAI_API_KEY to use refactoring"],
                "benefits": [],
                "diff_summary": "API not configured"
            }
        
        try:
            full_prompt = f"{system_prompt}\n\n{user_prompt}"
            content = await call_ai_api(self.api_key, self.bot_name, full_prompt)
            
            # Extract refactored code
            refactored_code = code
            if "```" in content:
                code_blocks = content.split("```")
                if len(code_blocks) >= 3:
                    refactored_code = code_blocks[1].split("\n", 1)[1] if "\n" in code_blocks[1] else code_blocks[1]
            
            return {
                "refactored_code": refactored_code.strip(),
                "explanation": content,
                "changes": self._extract_changes(content),
                "benefits": self._extract_benefits(content),
                "diff_summary": f"Refactored using {refactor_type} approach"
            }
        except Exception as e:
            return {
                "refactored_code": code,
                "explanation": f"Refactoring failed: {str(e)}",
                "changes": [],
                "benefits": [],
                "diff_summary": "Error occurred"
            }
    
    def _extract_changes(self, content: str) -> List[str]:
        """Extract changes from refactoring explanation"""
        changes = []
        lines = content.split('\n')
        for line in lines:
            line_lower = line.lower()
            if any(word in line_lower for word in ['changed', 'modified', 'updated', 'refactored', 'improved']):
                cleaned = line.strip().lstrip('-â€¢*0123456789. ')
                if cleaned and len(cleaned) > 10:
                    changes.append(cleaned)
        return changes[:8]
    
    def _extract_benefits(self, content: str) -> List[str]:
        """Extract benefits from refactoring explanation"""
        benefits = []
        lines = content.split('\n')
        for line in lines:
            line_lower = line.lower()
            if any(word in line_lower for word in ['benefit', 'advantage', 'improve', 'better', 'faster']):
                cleaned = line.strip().lstrip('-â€¢*0123456789. ')
                if cleaned and len(cleaned) > 10:
                    benefits.append(cleaned)
        return benefits[:5]


class TestGenerator:
    """
    AI-powered test case generation
    """
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")
        
        if self.api_key:
            self.bot_name = "Claude-3-Opus"  # Poe bot
            pass  # Using Groq/OpenAI API
        else:
            pass  # Groq/OpenAI API configured
    
    async def generate_tests(self, code: str, language: str, test_framework: Optional[str] = None) -> Dict[str, Any]:
        """Generate comprehensive test cases for code"""
        # Determine test framework based on language if not specified
        if not test_framework:
            frameworks = {
                "python": "pytest",
                "javascript": "jest",
                "typescript": "jest",
                "java": "junit",
                "go": "testing",
                "ruby": "rspec"
            }
            test_framework = frameworks.get(language.lower(), "unittest")
        
        system_prompt = f"""You are an expert in {language} testing using {test_framework}.
Generate comprehensive test cases including:
1. Unit tests for individual functions
2. Edge cases and boundary conditions
3. Error handling tests
4. Integration test suggestions
5. Test data examples
6. Mock/stub recommendations where needed

Follow {test_framework} best practices and conventions."""

        user_prompt = f"Generate tests for this {language} code:\n```{language}\n{code}\n```"
        
        if not self.api_key:
            return {
                "test_code": f"# Configure GROQ_API_KEY or OPENAI_API_KEY to generate tests",
                "test_cases": [],
                "coverage_estimate": 0,
                "framework": test_framework
            }
        
        try:
            full_prompt = f"{system_prompt}\n\n{user_prompt}"
            content = await call_ai_api(self.api_key, self.bot_name, full_prompt)
            
            # Extract test code
            test_code = ""
            if "```" in content:
                code_blocks = content.split("```")
                if len(code_blocks) >= 3:
                    test_code = code_blocks[1].split("\n", 1)[1] if "\n" in code_blocks[1] else code_blocks[1]
            
            # Count test cases
            test_count = test_code.count("def test_") + test_code.count("test(") + test_code.count("it(")
            
            return {
                "test_code": test_code.strip() if test_code else content,
                "explanation": content,
                "test_cases": self._extract_test_cases(content),
                "coverage_estimate": min(90, test_count * 15),
                "framework": test_framework,
                "setup_instructions": self._generate_setup_instructions(test_framework)
            }
        except Exception as e:
            return {
                "test_code": f"# Error generating tests: {str(e)}",
                "explanation": str(e),
                "test_cases": [],
                "coverage_estimate": 0,
                "framework": test_framework,
                "setup_instructions": ""
            }
    
    def _extract_test_cases(self, content: str) -> List[str]:
        """Extract test case descriptions"""
        test_cases = []
        lines = content.split('\n')
        for line in lines:
            if 'test' in line.lower() and ('def' in line or 'it(' in line or 'describe' in line):
                cleaned = line.strip().lstrip('-â€¢*0123456789. ')
                if cleaned and len(cleaned) > 5:
                    test_cases.append(cleaned)
        return test_cases[:15]
    
    def _generate_setup_instructions(self, framework: str) -> str:
        """Generate setup instructions for test framework"""
        instructions = {
            "pytest": "Install: pip install pytest\nRun: pytest test_file.py",
            "jest": "Install: npm install --save-dev jest\nRun: npm test",
            "junit": "Add JUnit dependency and run with your build tool",
            "testing": "Tests are built-in to Go\nRun: go test",
            "rspec": "Install: gem install rspec\nRun: rspec spec/"
        }
        return instructions.get(framework, "Refer to framework documentation")


class PerformanceOptimizer:
    """
    AI-powered performance optimization analyzer
    """
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")
        
        if self.api_key:
            self.bot_name = "Claude-3-Opus"  # Poe bot
            pass  # Using Groq/OpenAI API
        else:
            pass  # Groq/OpenAI API configured
    
    async def optimize(self, code: str, language: str, context: Optional[str] = None) -> Dict[str, Any]:
        """Analyze and optimize code for performance"""
        system_prompt = f"""You are a performance optimization expert for {language}.
Analyze the code and provide:
1. Performance bottlenecks identification
2. Time complexity analysis (Big O notation)
3. Space complexity analysis
4. Optimized version of the code
5. Specific optimization techniques applied
6. Benchmarking recommendations
7. Caching strategies if applicable
8. Database query optimizations if applicable"""

        user_prompt = f"Analyze and optimize this {language} code:\n```{language}\n{code}\n```"
        if context:
            user_prompt += f"\n\nContext: {context}"
        
        if not self.api_key:
            return {
                "optimized_code": code,
                "bottlenecks": ["Configure GROQ_API_KEY or OPENAI_API_KEY"],
                "improvements": [],
                "complexity_before": "O(?)",
                "complexity_after": "O(?)"
            }
        
        try:
            full_prompt = f"{system_prompt}\n\n{user_prompt}"
            content = await call_ai_api(self.api_key, self.bot_name, full_prompt)
            
            # Extract optimized code
            optimized_code = code
            if "```" in content:
                code_blocks = content.split("```")
                for i, block in enumerate(code_blocks):
                    if i > 0 and 'optim' in code_blocks[i-1].lower():
                        optimized_code = block.split("\n", 1)[1] if "\n" in block else block
                        break
                if optimized_code == code and len(code_blocks) >= 3:
                    optimized_code = code_blocks[-2].split("\n", 1)[1] if "\n" in code_blocks[-2] else code_blocks[-2]
            
            return {
                "optimized_code": optimized_code.strip(),
                "analysis": content,
                "bottlenecks": self._extract_bottlenecks(content),
                "improvements": self._extract_improvements(content),
                "complexity_analysis": self._extract_complexity(content),
                "performance_gain": "Estimated 20-50% improvement based on optimizations"
            }
        except Exception as e:
            return {
                "optimized_code": code,
                "analysis": f"Optimization failed: {str(e)}",
                "bottlenecks": [],
                "improvements": [],
                "complexity_analysis": "Unable to analyze",
                "performance_gain": "N/A"
            }
    
    def _extract_bottlenecks(self, content: str) -> List[str]:
        """Extract performance bottlenecks"""
        bottlenecks = []
        lines = content.split('\n')
        for line in lines:
            line_lower = line.lower()
            if any(word in line_lower for word in ['bottleneck', 'slow', 'inefficient', 'expensive', 'complexity']):
                cleaned = line.strip().lstrip('-â€¢*0123456789. ')
                if cleaned and len(cleaned) > 10:
                    bottlenecks.append(cleaned)
        return bottlenecks[:7]
    
    def _extract_improvements(self, content: str) -> List[str]:
        """Extract improvement suggestions"""
        improvements = []
        lines = content.split('\n')
        for line in lines:
            line_lower = line.lower()
            if any(word in line_lower for word in ['optim', 'improve', 'faster', 'cache', 'index', 'algorithm']):
                cleaned = line.strip().lstrip('-â€¢*0123456789. ')
                if cleaned and len(cleaned) > 10:
                    improvements.append(cleaned)
        return improvements[:8]
    
    def _extract_complexity(self, content: str) -> str:
        """Extract complexity analysis"""
        lines = content.split('\n')
        for line in lines:
            if 'O(' in line or 'complexity' in line.lower():
                return line.strip()
        return "Complexity analysis not available"


class DocumentationGenerator:
    """
    AI-powered documentation generator
    """
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")
        
        if self.api_key:
            self.bot_name = "Claude-3-Opus"  # Poe bot
            pass  # Using Groq/OpenAI API
        else:
            pass  # Groq/OpenAI API configured
    
    async def generate_docs(self, code: str, language: str, doc_type: str = "comprehensive") -> Dict[str, Any]:
        """Generate comprehensive documentation for code"""
        doc_types = {
            "comprehensive": "Full documentation with examples and API references",
            "inline": "Inline code comments and docstrings",
            "api": "API documentation in OpenAPI/Swagger format",
            "readme": "README documentation for the project",
            "tutorial": "Tutorial-style documentation with examples"
        }
        
        system_prompt = f"""You are a technical documentation expert for {language}.
Generate {doc_types.get(doc_type, 'comprehensive documentation')} including:
1. Overview and purpose
2. Function/class descriptions
3. Parameter documentation
4. Return value documentation
5. Usage examples
6. Code examples
7. Error handling notes
8. Best practices

Follow {language} documentation conventions (JSDoc, docstrings, JavaDoc, etc.)."""

        user_prompt = f"Generate documentation for this {language} code:\n```{language}\n{code}\n```"
        
        if not self.api_key:
            return {
                "documentation": "# Configure GROQ_API_KEY or OPENAI_API_KEY to generate documentation",
                "inline_comments": code,
                "examples": []
            }
        
        try:
            full_prompt = f"{system_prompt}\n\n{user_prompt}"
            content = await call_ai_api(self.api_key, self.bot_name, full_prompt)
            
            # Extract documented code if present
            documented_code = code
            if "```" in content:
                code_blocks = content.split("```")
                if len(code_blocks) >= 3:
                    for i, block in enumerate(code_blocks):
                        if language.lower() in code_blocks[i].lower():
                            documented_code = block.split("\n", 1)[1] if "\n" in block else block
                            break
            
            return {
                "documentation": content,
                "inline_comments": documented_code.strip(),
                "examples": self._extract_examples(content),
                "markdown": content,
                "doc_type": doc_type
            }
        except Exception as e:
            return {
                "documentation": f"# Documentation Generation Failed\n\n{str(e)}",
                "inline_comments": code,
                "examples": [],
                "markdown": "",
                "doc_type": doc_type
            }
    
    def _extract_examples(self, content: str) -> List[str]:
        """Extract code examples from documentation"""
        examples = []
        if "```" in content:
            blocks = content.split("```")
            for i, block in enumerate(blocks):
                if i % 2 == 1:  # Odd indices are code blocks
                    examples.append(block.strip())
        return examples[:5]


class AIAssistant:
    """
    Conversational AI Assistant for coding help and guidance
    Provides context-aware responses about programming, debugging, and best practices
    """
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")
        
        if self.api_key:
            self.bot_name = "Claude-3-Opus"  # Poe bot
            pass  # Using Groq/OpenAI API
            print("âœ“ AI Assistant initialized with Gemini 2.0 Flash")
        else:
            print("ERROR: Poe API key not configured for AI Assistant")
            pass  # Poe API configured
        
        # Conversation history for context
        self.conversation_history: List[Dict[str, str]] = []
    
    async def chat(
        self, 
        message: str, 
        context: Optional[Dict[str, Any]] = None,
        conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Chat with the AI assistant
        
        Args:
            message: User's message/question
            context: Optional context (code snippets, language, etc.)
            conversation_id: Optional ID to maintain conversation history
        
        Returns:
            Dict containing AI response and metadata
        """
        if not self.api_key:
            return {
                "response": "AI Assistant is not available. Please configure GROQ_API_KEY or OPENAI_API_KEY in your .env file.",
                "suggestions": ["Set GROQ_API_KEY or OPENAI_API_KEY environment variable", "Get API key from https://console.groq.com or https://platform.openai.com"],
                "code_examples": [],
                "references": []
            }
        
        try:
            # Build system context
            system_context = """You are an expert AI coding assistant integrated into a development environment.
You help developers with:
- Writing and explaining code in any programming language
- Debugging and troubleshooting issues
- Best practices and design patterns
- Performance optimization
- Security recommendations
- Code review feedback
- Learning programming concepts

Provide clear, practical, and actionable responses. Include code examples when relevant.
Format your responses with markdown for better readability."""

            # Add user context if provided
            if context:
                context_str = "\n\nCurrent Context:\n"
                if context.get("language"):
                    context_str += f"- Language: {context['language']}\n"
                if context.get("code"):
                    context_str += f"- Code Snippet:\n```{context.get('language', '')}\n{context['code']}\n```\n"
                if context.get("file_type"):
                    context_str += f"- File Type: {context['file_type']}\n"
                system_context += context_str
            
            # Build conversation prompt
            prompt = f"{system_context}\n\nUser: {message}\n\nAssistant:"
            
            # Generate response
            content = await call_ai_api(self.api_key, self.bot_name, prompt)
            
            content = content.strip()
            
            # Extract code examples
            code_examples = self._extract_code_blocks(content)
            
            # Extract suggestions
            suggestions = self._extract_suggestions(content)
            
            # Add to conversation history
            self.conversation_history.append({
                "role": "user",
                "content": message,
                "timestamp": datetime.now().isoformat()
            })
            self.conversation_history.append({
                "role": "assistant",
                "content": content,
                "timestamp": datetime.now().isoformat()
            })
            
            # Keep only last 10 messages
            if len(self.conversation_history) > 10:
                self.conversation_history = self.conversation_history[-10:]
            
            return {
                "response": content,
                "suggestions": suggestions,
                "code_examples": code_examples,
                "references": self._extract_references(content),
                "conversation_id": conversation_id or "default"
            }
            
        except Exception as e:
            return {
                "response": f"I encountered an error: {str(e)}. Please try rephrasing your question.",
                "suggestions": ["Try asking a more specific question", "Check your API configuration"],
                "code_examples": [],
                "references": []
            }
    
    def _extract_code_blocks(self, content: str) -> List[Dict[str, str]]:
        """Extract code blocks from markdown"""
        code_blocks = []
        if "```" in content:
            blocks = content.split("```")
            for i, block in enumerate(blocks):
                if i % 2 == 1:  # Odd indices are code blocks
                    lines = block.strip().split("\n", 1)
                    language = lines[0].strip() if lines else ""
                    code = lines[1] if len(lines) > 1 else block.strip()
                    code_blocks.append({
                        "language": language,
                        "code": code.strip()
                    })
        return code_blocks
    
    def _extract_suggestions(self, content: str) -> List[str]:
        """Extract actionable suggestions from response"""
        suggestions = []
        lines = content.split("\n")
        for line in lines:
            # Look for bullet points or numbered lists
            stripped = line.strip()
            if stripped.startswith(("- ", "* ", "â€¢ ")) or (len(stripped) > 2 and stripped[0].isdigit() and stripped[1] in ".):"):
                # Remove the bullet/number
                suggestion = stripped.lstrip("-*â€¢0123456789.): ").strip()
                if suggestion and len(suggestion) > 10:  # Filter out very short items
                    suggestions.append(suggestion)
        return suggestions[:5]  # Return top 5
    
    def _extract_references(self, content: str) -> List[str]:
        """Extract reference links or documentation mentions"""
        references = []
        # Look for common documentation patterns
        keywords = ["documentation", "docs", "reference", "learn more", "see also", "read about"]
        lines = content.split("\n")
        for line in lines:
            lower_line = line.lower()
            if any(keyword in lower_line for keyword in keywords):
                references.append(line.strip())
        return references[:3]
    
    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []












