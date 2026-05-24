import axios from "axios";
import { useState } from "react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { role: "user", text: message };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // ✅ Get token from localStorage
      const token = localStorage.getItem('auth');

      const res = await axios.post("http://127.0.0.1:8000/api/chat/", {
        message
      }, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const botMessage = {
        role: "assistant",
        text: res.data.assistant.message
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.log('Chatbot error:', error.response?.data);
      console.log('Chatbot status:', error.response?.status);

      // ✅ Show proper error message based on status
      let errorText = "Server error. Make sure Ollama is running!";
      if (error.response?.status === 401) {
        errorText = "Please login first to use the chatbot.";
      } else if (error.response?.status === 403) {
        errorText = "You don't have permission to use the chatbot.";
      }

      setMessages(prev => [...prev, {
        role: "assistant",
        text: errorText
      }]);
    }

    setMessage("");
    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-indigo-600 text-white text-2xl shadow-lg hover:bg-indigo-700 transition z-[9999] flex items-center justify-center">
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-5 w-80 h-[500px] bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-2xl z-[9999]">

          {/* Header */}
          <div className="bg-indigo-600 px-4 py-3">
            <p className="text-white font-black">🤖 AI Assistant</p>
            <p className="text-indigo-200 text-xs">Powered by Ollama</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-slate-400 text-center text-sm mt-10">Ask me anything!</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm font-medium ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-100 text-slate-800 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 px-4 py-2 rounded-2xl text-slate-400 text-sm rounded-bl-none">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-slate-100">
            <input
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Type a message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}