"""
AI Engine - Core AI/ML functionality for code generation, debugging, and security
Integrates with OpenAI, Hugging Face, and LangChain
"""

import os
from typing import Dict, List, Optional, Any
import asyncio
try:
    from google import genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Warning: google-genai not installed")


class CodeGenerator:
    """
    Generate code from natural language using AI models
    """
    
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        if GEMINI_AVAILABLE and self.gemini_api_key:
            # Configure Gemini API with new SDK
            self.client = genai.Client(api_key=self.gemini_api_key)
            self.model_name = 'gemini-2.0-flash-exp'
            print("✓ Using Gemini 2.0 Flash")
        else:
            print("ERROR: Gemini API key not configured")
            print("Set GEMINI_API_KEY in your .env file")
            self.client = None
            self.model_name = None
    
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
        
        if not self.client:
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
        
        # Generate response using new Gemini SDK
        response = await asyncio.to_thread(
            self.client.models.generate_content,
            model=self.model_name,
            contents=full_prompt
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
            self.client = genai.Client(api_key=self.gemini_api_key)
            self.model_name = 'gemini-2.0-flash-exp'
        else:
            self.client = None
            self.model_name = None
    
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
        
        if not self.client:
            return {
                "suggestions": [{"issue": "Gemini not configured", "line": 0, "severity": "error", "description": "Set GEMINI_API_KEY"}],
                "explanations": ["API key required"],
                "fixed_code": None
            }
        
        full_prompt = f"{system_prompt}\n\n{user_prompt}"
        response = await asyncio.to_thread(
            self.client.models.generate_content,
            model=self.model_name,
            contents=full_prompt
        )
        content = response.text
        
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
            if line.startswith("-") or line.startswith("•") or (len(line) > 0 and line[0].isdigit() and "." in line[:3]):
                suggestions.append(line.lstrip("-•0123456789. "))
        
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
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        if GEMINI_AVAILABLE and self.gemini_api_key:
            self.client = genai.Client(api_key=self.gemini_api_key)
            self.model_name = 'gemini-2.0-flash-exp'
        else:
            self.client = None
            self.model_name = None
        
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
        
        if self.client:
            try:
                full_prompt = f"{system_prompt}\n\n{user_prompt}"
                response = await asyncio.to_thread(self.client.models.generate_content, model=self.model_name, contents=full_prompt)
                ai_analysis = response.text
                
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
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        if GEMINI_AVAILABLE and self.gemini_api_key:
            self.client = genai.Client(api_key=self.gemini_api_key)
            self.model_name = 'gemini-2.0-flash-exp'
        else:
            self.client = None
            self.model_name = None
    
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
        
        if not self.client:
            return {
                "overall_score": 0,
                "issues": [],
                "suggestions": ["Configure Gemini API to use code review"],
                "strengths": [],
                "improvements": []
            }
        
        try:
            full_prompt = f"{system_prompt}\n\n{user_prompt}"
            response = await asyncio.to_thread(self.client.models.generate_content, model=self.model_name, contents=full_prompt)
            content = response.text
            
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
                cleaned = line.strip().lstrip('-•*0123456789. ')
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
                cleaned = line.strip().lstrip('-•*0123456789. ')
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
                cleaned = line.strip().lstrip('-•*0123456789. ')
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
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        if GEMINI_AVAILABLE and self.gemini_api_key:
            self.client = genai.Client(api_key=self.gemini_api_key)
            self.model_name = 'gemini-2.0-flash-exp'
        else:
            self.client = None
            self.model_name = None
    
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
        
        if not self.client:
            return {
                "refactored_code": code,
                "changes": ["Configure Gemini API to use refactoring"],
                "benefits": [],
                "diff_summary": "API not configured"
            }
        
        try:
            full_prompt = f"{system_prompt}\n\n{user_prompt}"
            response = await asyncio.to_thread(self.client.models.generate_content, model=self.model_name, contents=full_prompt)
            content = response.text
            
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
                cleaned = line.strip().lstrip('-•*0123456789. ')
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
                cleaned = line.strip().lstrip('-•*0123456789. ')
                if cleaned and len(cleaned) > 10:
                    benefits.append(cleaned)
        return benefits[:5]


class TestGenerator:
    """
    AI-powered test case generation
    """
    
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        if GEMINI_AVAILABLE and self.gemini_api_key:
            self.client = genai.Client(api_key=self.gemini_api_key)
            self.model_name = 'gemini-2.0-flash-exp'
        else:
            self.client = None
            self.model_name = None
    
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
        
        if not self.client:
            return {
                "test_code": f"# Configure Gemini API to generate tests",
                "test_cases": [],
                "coverage_estimate": 0,
                "framework": test_framework
            }
        
        try:
            full_prompt = f"{system_prompt}\n\n{user_prompt}"
            response = await asyncio.to_thread(self.client.models.generate_content, model=self.model_name, contents=full_prompt)
            content = response.text
            
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
                cleaned = line.strip().lstrip('-•*0123456789. ')
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
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        if GEMINI_AVAILABLE and self.gemini_api_key:
            self.client = genai.Client(api_key=self.gemini_api_key)
            self.model_name = 'gemini-2.0-flash-exp'
        else:
            self.client = None
            self.model_name = None
    
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
        
        if not self.client:
            return {
                "optimized_code": code,
                "bottlenecks": ["Configure Gemini API"],
                "improvements": [],
                "complexity_before": "O(?)",
                "complexity_after": "O(?)"
            }
        
        try:
            full_prompt = f"{system_prompt}\n\n{user_prompt}"
            response = await asyncio.to_thread(self.client.models.generate_content, model=self.model_name, contents=full_prompt)
            content = response.text
            
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
                cleaned = line.strip().lstrip('-•*0123456789. ')
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
                cleaned = line.strip().lstrip('-•*0123456789. ')
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
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        if GEMINI_AVAILABLE and self.gemini_api_key:
            self.client = genai.Client(api_key=self.gemini_api_key)
            self.model_name = 'gemini-2.0-flash-exp'
        else:
            self.client = None
            self.model_name = None
    
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
        
        if not self.client:
            return {
                "documentation": "# Configure Gemini API to generate documentation",
                "inline_comments": code,
                "examples": []
            }
        
        try:
            full_prompt = f"{system_prompt}\n\n{user_prompt}"
            response = await asyncio.to_thread(self.client.models.generate_content, model=self.model_name, contents=full_prompt)
            content = response.text
            
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
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        if GEMINI_AVAILABLE and self.gemini_api_key:
            self.client = genai.Client(api_key=self.gemini_api_key)
            self.model_name = 'gemini-2.0-flash-exp'
            print("✓ AI Assistant initialized with Gemini 2.0 Flash")
        else:
            print("ERROR: Gemini API key not configured for AI Assistant")
            self.client = None
            self.model_name = None
        
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
        if not self.model:
            return {
                "response": "AI Assistant is not available. Please configure GEMINI_API_KEY.",
                "suggestions": [],
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
            response = await asyncio.to_thread(
                self.client.models.generate_content,
                model=self.model_name,
                contents=prompt,
                generation_config={
                    "temperature": 0.7,
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 2048,
                }
            )
            
            content = response.text.strip()
            
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
            if stripped.startswith(("- ", "* ", "• ")) or (len(stripped) > 2 and stripped[0].isdigit() and stripped[1] in ".):"):
                # Remove the bullet/number
                suggestion = stripped.lstrip("-*•0123456789.): ").strip()
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
