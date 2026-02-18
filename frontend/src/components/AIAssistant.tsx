import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiTrash2, FiCode, FiMessageCircle, FiCopy, FiCheck } from 'react-icons/fi';
import { chatWithAssistant, clearChatHistory } from '../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  code_examples?: Array<{ language: string; code: string }>;
  suggestions?: string[];
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(() => `conv-${Date.now()}`);
  const [contextCode, setContextCode] = useState('');
  const [contextLanguage, setContextLanguage] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build context if provided
      const context = contextCode.trim()
        ? {
            code: contextCode,
            language: contextLanguage || 'auto',
          }
        : undefined;

      console.log('Sending chat message:', {
        message: input,
        context,
        conversation_id: conversationId,
      });

      const response = await chatWithAssistant(input, context, conversationId);

      console.log('Chat response:', response);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
        code_examples: response.code_examples,
        suggestions: response.suggestions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ Error: ${error.response?.data?.detail || error.message || 'Failed to get response'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Clear all conversation history?')) {
      try {
        await clearChatHistory();
        setMessages([]);
        setContextCode('');
        setContextLanguage('');
      } catch (error) {
        console.error('Failed to clear history:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatMessageContent = (content: string) => {
    // Simple markdown-like formatting
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Code blocks are handled separately
      if (line.startsWith('```')) return null;
      
      // Bold
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Inline code
      line = line.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-gray-700 rounded text-sm">$1</code>');
      
      // Headers
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-lg font-semibold mt-3 mb-1">{line.slice(4)}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-bold mt-4 mb-2">{line.slice(3)}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-2xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
      }
      
      // Lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={i} className="ml-4">{line.slice(2)}</li>;
      }
      
      return line ? (
        <p key={i} dangerouslySetInnerHTML={{ __html: line }} className="mb-2" />
      ) : (
        <br key={i} />
      );
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiMessageCircle className="text-3xl text-purple-300" />
            <div>
              <h2 className="text-2xl font-bold text-white">AI Coding Assistant</h2>
              <p className="text-purple-200 text-sm">
                Ask me anything about coding, debugging, or best practices
              </p>
            </div>
          </div>
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            title="Clear conversation"
          >
            <FiTrash2 />
            Clear
          </button>
        </div>
      </div>

      {/* Optional Context Panel */}
      <div className="bg-gray-800 border-b border-gray-700">
        <button
          onClick={() => setShowContext(!showContext)}
          className="w-full px-6 py-2 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <FiCode />
          {showContext ? 'Hide' : 'Add'} Code Context (Optional)
        </button>
        
        {showContext && (
          <div className="px-6 pb-4 space-y-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Language</label>
              <input
                type="text"
                value={contextLanguage}
                onChange={(e) => setContextLanguage(e.target.value)}
                placeholder="e.g., python, javascript"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Code Snippet</label>
              <textarea
                value={contextCode}
                onChange={(e) => setContextCode(e.target.value)}
                placeholder="Paste code here for context-aware assistance..."
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-900">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <FiMessageCircle className="text-6xl mx-auto mb-4 text-gray-600" />
            <p className="text-lg mb-2">Start a conversation with your AI coding assistant</p>
            <p className="text-sm">Ask about code, debugging, optimization, best practices, and more!</p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
              <div className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors" onClick={() => setInput('How do I optimize a slow database query?')}>
                <p className="text-sm text-purple-300">💡 "How do I optimize a slow database query?"</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors" onClick={() => setInput('Explain the difference between async and sync in JavaScript')}>
                <p className="text-sm text-purple-300">🤔 "Explain async vs sync in JavaScript"</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors" onClick={() => setInput('What are common security vulnerabilities in web apps?')}>
                <p className="text-sm text-purple-300">🔒 "Common security vulnerabilities?"</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors" onClick={() => setInput('Review my code for best practices')}>
                <p className="text-sm text-purple-300">✨ "Review my code for best practices"</p>
              </div>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-100 border border-gray-700'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2 text-purple-300 text-sm font-semibold">
                  <FiMessageCircle />
                  AI Assistant
                </div>
              )}
              
              <div className="prose prose-invert max-w-none">
                {formatMessageContent(message.content)}
              </div>

              {/* Code Examples */}
              {message.code_examples && message.code_examples.length > 0 && (
                <div className="mt-4 space-y-3">
                  {message.code_examples.map((example, idx) => (
                    <div key={idx} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
                        <span className="text-sm text-gray-400">{example.language || 'code'}</span>
                        <button
                          onClick={() => copyToClipboard(example.code, idx)}
                          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <FiCheck className="text-green-400" />
                              <span className="text-green-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <FiCopy />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-3 overflow-x-auto">
                        <code className="text-sm text-gray-300 font-mono">{example.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-4 p-3 bg-indigo-900/30 border border-indigo-700 rounded-lg">
                  <p className="text-sm font-semibold text-indigo-300 mb-2">💡 Suggestions</p>
                  <ul className="space-y-1">
                    {message.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-sm text-gray-300">• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-xs text-gray-400 mt-2">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 text-purple-300">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about coding... (Press Enter to send, Shift+Enter for new line)"
            rows={2}
            className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none resize-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <FiSend />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
