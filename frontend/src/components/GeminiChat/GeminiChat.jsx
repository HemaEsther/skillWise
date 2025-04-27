import { useState, useRef, useEffect } from 'react';
import { FiMinimize2, FiMaximize2, FiSend, FiX } from 'react-icons/fi';
import api from '../../utils/axios';

const GeminiChat = () => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const { data } = await api.post('/gemini/chat', { message: userMessage });
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response 
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: error.response?.data?.message || 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center space-x-2 md:p-4 sm:p-3"
      >
        <span className="text-sm font-medium hidden md:inline">AI Assistant</span>
        <span className="text-sm font-medium md:hidden">AI</span>
      </button>
    );
  }

  return (
    <div 
      className={`
        fixed z-50 bg-gray-900 border border-gray-700 shadow-2xl flex flex-col
        ${isMobile 
          ? 'inset-0 rounded-none' // Full screen on mobile
          : 'bottom-4 right-4 w-96 h-[500px] rounded-lg' // Fixed size on desktop
        }
      `}
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 flex justify-between items-center">
        <h3 className="text-white font-semibold">Gemini AI Assistant</h3>
        <div className="flex items-center space-x-2">
          {isMobile ? (
            <button
              onClick={() => setIsMinimized(true)}
              className="text-white/70 hover:text-white transition-colors p-2"
            >
              <FiX className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={() => setIsMinimized(true)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <FiMinimize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
        {messages.length === 0 && (
          <div className="text-gray-400 text-center p-4">
            <p className="text-lg mb-2">👋 Hi! I'm your AI assistant.</p>
            <p className="text-sm">How can I help you today?</p>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[85%] p-3 rounded-lg break-words
                ${message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-800 text-gray-100 rounded-bl-none'
                }
              `}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-100 p-3 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-800">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center min-w-[44px]"
            aria-label="Send message"
          >
            <FiSend className={`w-5 h-5 ${isMobile ? 'md:mr-2' : ''}`} />
            {!isMobile && <span className="hidden md:inline ml-2">Send</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeminiChat; 