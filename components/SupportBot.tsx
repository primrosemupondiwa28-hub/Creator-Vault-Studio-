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
        setMessages([{ role: 'model', text: "Hello! I'm the **Vault Assistant**. How can I help you create today? Ask me about Twinly, UGC Studio, or troubleshooting!" }]);
      } catch (e) { console.error("Support bot init failed", e); }
    }
  }, [apiKey]);

  const handleSend = async () => {
    if (!input.trim() || !chatRef.current) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);
    try {
      const response = await chatRef.current.sendMessage({ message: userText });
      setMessages(prev => [...prev, { role: 'model', text: response.text || "I'm having trouble connecting." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error." }]);
    } finally { setIsLoading(false); }
  };

  if (!apiKey) return null;

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className={`fixed bottom-6 left-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 group ${isOpen ? 'bg-luxury-800 text-brand-400 rotate-90' : 'bg-brand-600 text-white'}`}>
        {isOpen ? <X className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
      </button>
      <div className={`fixed bottom-24 left-6 z-50 w-[350px] md:w-[400px] bg-luxury-900 border border-brand-900 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 flex flex-col ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`} style={{ maxHeight: 'min(500px, 80vh)' }}>
        <div className="bg-luxury-800 p-4 border-b border-brand-900 flex items-center gap-3">
          <div className="p-2 bg-brand-900/50 rounded-full border border-brand-500/20"><Bot className="w-5 h-5 text-brand-500" /></div>
          <div><h3 className="font-serif font-bold text-brand-50 text-sm">Vault Assistant</h3><p className="text-[10px] text-brand-400 font-bold uppercase tracking-widest">AI Strategist</p></div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-luxury-950/50">
           {messages.map((msg, idx) => (
             <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`max-w-[80%] rounded-xl p-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-brand-600 text-white' : 'bg-luxury-800 text-brand-50 border border-brand-900'}`}>{msg.text}</div>
             </div>
           ))}
           <div ref={messagesEndRef} />
        </div>
        <div className="p-4 bg-luxury-800 border-t border-brand-900">
           <div className="relative">
             <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                placeholder="Type a message..." 
                className="w-full bg-brand-50 border border-brand-500 rounded-full py-3 pl-5 pr-12 text-sm text-black font-bold outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-gray-500 shadow-inner" 
             />
             <button onClick={handleSend} disabled={!input.trim() || isLoading} className="absolute right-2 top-2 p-1.5 bg-brand-600 text-white rounded-full transition-all hover:scale-105"><Send className="w-4 h-4" /></button>
           </div>
        </div>
      </div>
    </>
  );
};