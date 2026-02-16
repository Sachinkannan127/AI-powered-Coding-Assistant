"""
AI Engine - Core AI/ML functionality for code generation, debugging, and security
Integrates with OpenAI, Hugging Face, and LangChain
"""

import os
from typing import Dict, List, Optional, Any
import asyncio
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Warning: google-generativeai not installed")


class CodeGenerator:
    """
    Generate code from natural language using AI models
    """
    
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        if GEMINI_AVAILABLE and self.gemini_api_key:
            # Configure Gemini API
            genai.configure(api_key=self.gemini_api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
            print("✓ Using Gemini 2.5 Flash")
        else:
            print("ERROR: Gemini API key not configured")
            print("Set GEMINI_API_KEY in your .env file")
            self.model = None
    
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
        system_prompt = f"""You are an expert {language} developer and coding assistant.
Generate clean, efficient, and well-documented code based on the user's request.
Include:
1. Working code implementation
2. Step-by-step explanation of the algorithm
3. Optimization suggestions
4. Auto-generated documentation/comments
"""
        
        user_prompt = f"Request: {prompt}\n"
        if context:
            user_prompt += f"\nExisting context:\n{context}\n"
        
        user_prompt += f"\nGenerate {language} code for this request."
        
        if not self.model:
            return {
                "code": "# Error: Gemini API not configured",
                "explanation": "Please set GEMINI_API_KEY in your .env file",
                "optimization_tips": ["Get API key from https://aistudio.google.com/"],
                "documentation": "Configure Gemini API to use Smart DevCopilot"
            }
        
        result = await self._generate_with_gemini(system_prompt, user_prompt)
        return result
    
    async def _generate_with_gemini(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        """Generate using Gemini API"""
        # Combine system and user prompts for Gemini
        full_prompt = f"{system_prompt}\n\n{user_prompt}"
        
        # Generate response using Gemini
        response = await asyncio.to_thread(
            self.model.generate_content,
            full_prompt
        )
        
        # Parse response to extract code, explanation, tips, and docs
        content = response.text
        
        # Simple parsing (can be enhanced with structured output)
        code_start = content.find("```")
        code_end = content.rfind("```")
        
        if code_start != -1 and code_end != -1:
            code = content[code_start:code_end].split("\n", 1)[1] if "\n" in content[code_start:code_end] else ""
            explanation = content[:code_start].strip()
        else:
            code = content
            explanation = "Code generated successfully."
        
        return {
            "code": code.strip(),
            "explanation": explanation or "Implementation based on your requirements.",
            "optimization_tips": [
                "Consider edge cases and error handling",
                "Add input validation",
                "Use type hints for better code clarity",
                "Consider performance implications for large datasets"
            ],
            "documentation": self._generate_documentation(code, explanation)
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
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        if GEMINI_AVAILABLE and self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            self.model = None
    
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
        
        if not self.model:
            return {
                "suggestions": [{"issue": "Gemini not configured", "line": 0, "severity": "error", "description": "Set GEMINI_API_KEY"}],
                "explanations": ["API key required"],
                "fixed_code": None
            }
        
        full_prompt = f"{system_prompt}\n\n{user_prompt}"
        response = await asyncio.to_thread(self.model.generate_content, full_prompt)
        content = response.text
        
        # Extract fixed code if present
        fixed_code = None
        if "```" in content:
            code_blocks = content.split("```")
            if len(code_blocks) >= 3:
                fixed_code = code_blocks[1].split("\n", 1)[1] if "\n" in code_blocks[1] else code_blocks[1]
        
        return {
            "suggestions": [
                {
                    "issue": "Code analysis completed",
                    "line": 0,
                    "severity": "info",
                    "description": content
                }
            ],
            "explanations": [
                "Review the suggestions above",
                "Test the fixed code thoroughly",
                "Consider edge cases"
            ],
            "fixed_code": fixed_code
        }


class SecurityScanner:
    """
    Scan code for security vulnerabilities
    """
    
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        if GEMINI_AVAILABLE and self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            self.model = None
        
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
        vulnerabilities = []
        severity_levels = {"critical": 0, "high": 0, "medium": 0, "low": 0}
        
        # Pattern-based detection
        if language in self.vulnerability_patterns:
            for pattern, description in self.vulnerability_patterns[language]:
                if pattern in code:
                    vulnerabilities.append({
                        "pattern": pattern,
                        "description": description,
                        "severity": "high",
                        "line": self._find_line_number(code, pattern)
                    })
                    severity_levels["high"] += 1
        
        # AI-based deep analysis
        system_prompt = f"""You are a security expert analyzing {language} code.
Identify security vulnerabilities including:
- SQL injection
- XSS attacks
- CSRF vulnerabilities
- Authentication issues
- Data exposure
- Insecure dependencies
Provide severity levels and remediation steps.
"""
        
        user_prompt = f"Analyze this {language} code for security issues:\n```{language}\n{code}\n```"
        
        if not self.model:
            ai_analysis = "Gemini API not configured. Set GEMINI_API_KEY in .env file."
        else:
            full_prompt = f"{system_prompt}\n\n{user_prompt}"
            response = await asyncio.to_thread(self.model.generate_content, full_prompt)
            ai_analysis = response.text
        
        recommendations = [
            "Use parameterized queries to prevent SQL injection",
            "Sanitize user inputs",
            "Implement proper authentication and authorization",
            "Use HTTPS for all communications",
            "Keep dependencies up to date",
            "Follow OWASP security guidelines"
        ]
        
        return {
            "vulnerabilities": vulnerabilities,
            "severity_levels": severity_levels,
            "recommendations": recommendations,
            "ai_analysis": ai_analysis
        }
    
    def _find_line_number(self, code: str, pattern: str) -> int:
        """Find line number of a pattern in code"""
        lines = code.split("\n")
        for i, line in enumerate(lines, 1):
            if pattern in line:
                return i
        return 0
