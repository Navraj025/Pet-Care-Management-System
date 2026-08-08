import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, User as UserIcon } from 'lucide-react';
import API from '../services/api';

const PetAiAssistantModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your Smart Pet Care AI Assistant. How can I help you with appointments, vaccination records, or pet health FAQs today?',
      actions: ['Book an Appointment', 'Check Vaccinations', 'Clinic Hours']
    }
  ]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || prompt;
    if (!textToSend.trim()) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await API.post('/ai-assistant/query', { prompt: textToSend });
      const botMsg = {
        sender: 'bot',
        text: res.data.response,
        actions: res.data.suggested_actions || []
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("AI Query Error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: "I'm sorry, I encountered a temporary connection issue. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center space-x-2 border-2 border-white/20 group"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-semibold pr-1">
          Pet Care AI
        </span>
      </button>

      {/* Modal / Floating Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-700 to-teal-900 p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                <Bot className="w-6 h-6 text-teal-200" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">Smart Pet Care AI</h3>
                <p className="text-xs text-teal-200">Virtual Assistant & FAQ Bot</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-teal-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-teal-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-2">
                      {msg.actions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(act)}
                          className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium px-2.5 py-1 rounded-lg border border-teal-200 transition-colors"
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl p-3 text-xs text-slate-500 flex items-center space-x-2">
                  <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span className="ml-1">Assistant typing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask about vaccinations, appointments, care..."
              className="flex-1 bg-slate-100 text-slate-800 text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default PetAiAssistantModal;
