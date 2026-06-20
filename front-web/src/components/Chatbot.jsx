import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, HelpCircle, Loader2 } from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import { markdownOverrides } from './markdownComponents';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! 👋 I'm Yohanes' digital assistant. Ask me anything about his background, coding projects, skills, or contact info. Or click one of the questions below to get started!"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const quickQuestions = [
    "Who is Yohanes Debebe?",
    "What are his core backend skills?",
    "Tell me about the Yope AI project.",
    "How can I contact Yohanes?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    if (!textToSend) setInput('');

    // Add user message
    const updatedMessages = [...messages, { role: 'user', content: query }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Send chat log to express backend
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages((prev) => [
        ...prev, 
        { 
          role: 'assistant', 
          content: "I'm sorry, I'm having trouble connecting to my server right now. Feel free to contact Yohanes directly at **yopeman318@gmail.com**!" 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-indigo-600 dark:bg-violet-600 night:bg-purple-600 text-white shadow-xl hover:bg-indigo-500 dark:hover:bg-violet-500 night:hover:bg-purple-500 hover:scale-105 transition-all duration-300 cursor-pointer glow-purple"
          aria-label="Open Chat Assistant"
        >
          <MessageSquare className="w-6 h-6 animate-pulse" />
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[500px] rounded-3xl bg-white dark:bg-slate-900 night:bg-black border border-slate-200/80 dark:border-slate-800 night:border-purple-900/30 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
          
          {/* Header */}
          <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/50 night:bg-purple-950/10 border-b border-slate-100 dark:border-slate-800/80 night:border-purple-900/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-violet-950/50 flex items-center justify-center text-indigo-600 dark:text-violet-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Yope Assistant</h3>
                <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live Agent
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages View */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 ticks-bg">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {msg.role !== 'user' && (
                  <div className="w-7 h-7 shrink-0 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                
                <div className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed border ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 border-indigo-600 text-white rounded-tr-none'
                    : 'bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700/50 night:bg-black/60 night:border-purple-900/10 text-slate-700 dark:text-slate-300'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-line">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <Markdown options={{ overrides: markdownOverrides }}>{msg.content}</Markdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* AI Typing Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 max-w-[80%]">
                <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-violet-900/40 night:bg-purple-950/60 flex items-center justify-center text-slate-500 dark:text-violet-300 night:text-purple-300">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-white border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50 night:bg-black/60 night:border-purple-900/10 rounded-2xl rounded-tl-none text-slate-400 dark:text-violet-400 night:text-purple-400 flex items-center gap-1">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Chips */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 py-2 border-t border-slate-100/50 dark:border-slate-800/50 night:border-purple-900/10 bg-slate-50/50 dark:bg-slate-800/20 night:bg-black/40">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                <HelpCircle className="w-3 h-3" /> Quick Questions
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-[76px] overflow-y-auto">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="px-2.5 py-1 text-xs rounded-lg border text-left cursor-pointer transition-all duration-200
                      bg-white hover:bg-slate-50 text-slate-600 border-slate-200
                      dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 dark:border-slate-700
                      night:bg-black night:hover:bg-purple-950/10 night:text-purple-400 night:border-purple-900/25"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box Footer */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 night:border-purple-900/20 bg-slate-50 dark:bg-slate-800/40 night:bg-black/80 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              placeholder="Ask me something about Yohanes..."
              className="flex-grow px-3 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800 dark:text-white night:bg-black night:border-purple-900/20 border-slate-200 focus:outline-none focus:border-indigo-500 dark:focus:border-violet-500 night:focus:border-purple-500 transition-colors disabled:opacity-75"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-xl bg-indigo-600 dark:bg-violet-600 night:bg-purple-600 hover:bg-indigo-500 dark:hover:bg-violet-500 night:hover:bg-purple-500 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
