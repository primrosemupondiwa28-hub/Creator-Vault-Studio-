import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, HelpCircle, Loader2 } from 'lucide-react';
import { initSupportChat } from '../services/geminiService';
import { Chat } from "@google/genai";

interface SupportBotProps {
  apiKey: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const SupportBot: React.FC<SupportBotProps> = ({ apiKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (apiKey && !chatRef.current) {
      try {
        chatRef.current = initSupportChat(apiKey);
        setMessages([
          { role: 'model', text: "Hello! I'm the **Vault Assistant**. How can I help you create today? Ask me about Twinly, Creator Studio, or troubleshooting!" }
        ]);
      } catch (e) {
        console.error("Support bot init failed", e);
      }
    }
  }, [apiKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || !chatRef.current) return;
    
    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userText });
      if (response.text) {
         setMessages(prev => [...prev, { role: 'model', text: response.text || "I'm having trouble connecting. Please try again." }]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please check your API Key." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!apiKey) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 left-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 group hover:scale-110 ${
          isOpen ? 'bg-luxury-800 text-brand-400 rotate-90' : 'bg-brand-600 text-white'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
        
        {!isOpen && (
           <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-luxury-800 text-brand-100 text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-brand-900/50 pointer-events-none">
              Need Help?
           </span>
        )}
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-24 left-6 z-50 w-[350px] md:w-[400px] bg-luxury-900 border border-brand-900 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-left flex flex-col ${
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
        style={{ maxHeight: 'min(500px, 80vh)' }}
      >
        {/* Header */}
        <div className="bg-luxury-800 p-4 border-b border-brand-900 flex items-center gap-3">
          <div className="p-2 bg-brand-900/50 rounded-full border border-brand-500/20">
             <Bot className="w-5 h-5 text-brand-500" />
          </div>
          <div>
             <h3 className="font-serif font-bold text-brand-50 text-sm">Vault Assistant</h3>
             <p className="text-[10px] text-brand-400">Online • AI Support</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-luxury-950/50 scrollbar-thin scrollbar-thumb-brand-900">
           {messages.map((msg, idx) => (
             <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-brand-600' : 'bg-luxury-800 border border-brand-900'}`}>
                   {msg.role === 'user' ? <div className="w-2 h-2 bg-white rounded-full" /> : <Bot className="w-4 h-4 text-brand-400" />}
                </div>
                <div 
                  className={`max-w-[80%] rounded-xl p-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-brand-600 text-white rounded-tr-none' 
                      : 'bg-luxury-800 text-brand-100 border border-brand-900 rounded-tl-none'
                  }`}
                >
                  <div dangerouslySetInnerHTML={{ 
                    __html: msg.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br/>')
                  }} />
                </div>
             </div>
           ))}
           {isLoading && (
              <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-luxury-800 border border-brand-900 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
                 </div>
                 <div className="bg-luxury-800 rounded-xl rounded-tl-none p-3 border border-brand-900">
                    <div className="flex gap-1">
                       <div className="w-1.5 h-1.5 bg-brand-400/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                       <div className="w-1.5 h-1.5 bg-brand-400/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                       <div className="w-1.5 h-1.5 bg-brand-400/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                 </div>
              </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-luxury-800 border-t border-brand-900">
           <div className="relative">
             <input
               type="text"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={handleKeyDown}
               placeholder="Ask a question..."
               className="w-full bg-luxury-900 border border-brand-900 rounded-full py-2.5 pl-4 pr-10 text-sm text-brand-50 focus:border-brand-500 outline-none placeholder:text-brand-900"
             />
             <button
               onClick={handleSend}
               disabled={!input.trim() || isLoading}
               className="absolute right-1.5 top-1.5 p-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-full transition-colors disabled:opacity-50"
             >
                <Send className="w-3.5 h-3.5" />
             </button>
           </div>
        </div>
      </div>
    </>
  );
};