import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, MessageSquare } from 'lucide-react';

const ChatDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = { text: inputText, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // The placeholder will be replaced by sed during Docker container startup
      const placeholder = '__VITE_API_URL_PLACEHOLDER__';
      const apiUrl = placeholder === '__VITE_API_URL_PLACEHOLDER__' ? 'http://localhost:8000' : placeholder;
      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: userMessage.text }),
      });

      const data = await response.json();
      
      const botMessage = { 
        text: data.reply, 
        sender: 'bot',
        emotion: data.emotion 
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error connecting to backend:", error);
      setMessages((prev) => [...prev, { text: "Sorry, I'm having trouble connecting to the server.", sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getEmotionColor = (emotion) => {
    switch (emotion?.toLowerCase()) {
      case 'joy': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'sadness': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'anger': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'fear': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'surprise': return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 'neutral':
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center p-4 sm:p-8 max-w-5xl mx-auto w-full">
      <div className="w-full text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">How are you feeling today?</h2>
        <p className="text-slate-400">Share your thoughts and let our AI analyze your emotional state.</p>
      </div>

      <div className="glass-panel w-full flex-1 flex flex-col max-h-[700px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-white/5">
          <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center">
            <Bot className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">MindEase Assistant</h3>
            <div className="flex items-center gap-2 text-xs text-brand-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow"></span>
              Online
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <MessageSquare className="w-12 h-12 text-slate-600 mb-2 opacity-50" />
              <p>Your conversation will appear here.</p>
              <div className="flex gap-2 flex-wrap justify-center mt-4 max-w-md">
                <button onClick={() => setInputText("I've been feeling really overwhelmed with work lately.")} className="px-4 py-2 rounded-full border border-white/10 text-sm hover:bg-white/5 transition-colors">
                  "I've been feeling overwhelmed..."
                </button>
                <button onClick={() => setInputText("I had a great day today, everything went perfectly!")} className="px-4 py-2 rounded-full border border-white/10 text-sm hover:bg-white/5 transition-colors">
                  "I had a great day today..."
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                    msg.sender === 'user' ? 'bg-indigo-500/20' : 'bg-brand-500/20'
                  }`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4 text-indigo-300" /> : <Bot className="w-4 h-4 text-brand-400" />}
                  </div>

                  {/* Message Bubble */}
                  <div className="flex flex-col gap-1">
                    <div className={`px-5 py-3 rounded-2xl ${
                      msg.sender === 'user' 
                        ? 'bg-brand-600 text-white rounded-tr-sm' 
                        : 'bg-white/10 border border-white/5 text-slate-200 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                    
                    {/* Emotion Tag */}
                    {msg.emotion && (
                      <div className={`self-start text-xs px-2.5 py-1 rounded-full border ${getEmotionColor(msg.emotion)} flex items-center gap-1.5 mt-1 shadow-lg`}>
                        <div className="w-1 h-1 rounded-full bg-current"></div>
                        {msg.emotion}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex w-full justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-brand-500/20">
                   <Bot className="w-4 h-4 text-brand-400" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-white/10 border border-white/5 text-slate-200 rounded-tl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                  <span className="text-sm text-slate-400">Analyzing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/5 border-t border-white/10">
          <form onSubmit={sendMessage} className="flex gap-3 relative">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message here..." 
              className="flex-1 bg-black/20 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all shadow-inner"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !inputText.trim()}
              className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:hover:bg-brand-600 text-white p-4 rounded-xl transition-colors flex items-center justify-center shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
      
      {/* Background glow specific to chat */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-600/10 rounded-full blur-[150px] -z-10 pointer-events-none" />
    </div>
  );
};

export default ChatDashboard;
