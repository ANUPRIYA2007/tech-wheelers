import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Mic, MicOff, Volume2, X, Sparkles, User, RefreshCw } from 'lucide-react';
import { askHeroAI } from '../../services/aiGateway';
import { useLanguage } from '../../context/LanguageContext';

export default function HeroChatbot({ isOpenProp, onCloseProp }) {
  const { language, t } = useLanguage();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isOpenProp !== undefined ? isOpenProp : internalOpen;
  
  const setIsOpen = (val) => {
    setInternalOpen(val);
    if (!val && onCloseProp) onCloseProp();
  };
  const [messages, setMessages] = useState([
    {
      sender: 'hero',
      text: t('hero.welcome', 'Hello! I am Hero, your AI Farming Assistant. Ask me about queue tokens, slot booking, crop moisture, or payment status!'),
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { sender: 'user', text: query, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const responseText = await askHeroAI(query, language);
      const heroMsg = { sender: 'hero', text: responseText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, heroMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { sender: 'hero', text: 'Sorry, I had trouble processing that. Please try asking again.', time: 'Now' }]);
    } finally {
      setLoading(false);
    }
  };

  // Speech Recognition (Voice Input)
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;

    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      handleSend(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  // Text-To-Speech (Voice Output)
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const SUGGESTED_PROMPTS = [
    t('chipToken', 'My Token'),
    t('chipSlot', 'Book Slot'),
    t('chipProcurement', 'Procurement Status'),
    t('chipPayment', 'Payment'),
    t('chipHelp', 'Help')
  ];

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-primary-600 to-emerald-600 text-white shadow-2xl hover:scale-105 transition-all duration-300 ring-4 ring-primary-500/20 group"
          aria-label="Open Hero AI Assistant"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 ring-2 ring-white" />
          </div>
          <span className="font-semibold text-sm hidden sm:inline">Ask Hero AI</span>
          <Sparkles className="w-4 h-4 text-amber-300 opacity-80" />
        </button>
      )}

      {/* Floating Chat Modal Drawer */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[92vw] sm:w-[420px] h-[560px] max-h-[85vh] rounded-2xl bg-white dark:bg-surface-900 shadow-2xl border border-surface-200 dark:border-surface-700 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-primary-700 via-primary-600 to-emerald-600 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base flex items-center gap-1.5">
                  Hero AI Agent <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </h3>
                <p className="text-xs text-primary-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Farmer Assistant (Voice + AI)
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-surface-50/50 dark:bg-surface-950/50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'hero' && (
                  <div className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-primary-600 text-white rounded-br-none shadow-sm'
                    : 'bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 border border-surface-200 dark:border-surface-700 rounded-bl-none shadow-sm'
                }`}>
                  <div className="whitespace-pre-line">{msg.text}</div>
                  <div className={`text-[10px] mt-1.5 flex items-center gap-2 ${msg.sender === 'user' ? 'text-primary-100 justify-end' : 'text-surface-400'}`}>
                    <span>{msg.time}</span>
                    {msg.sender === 'hero' && (
                      <button
                        onClick={() => speakText(msg.text)}
                        className="hover:text-primary-500 transition-colors"
                        title="Listen to response"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-surface-300 dark:bg-surface-700 text-surface-700 dark:text-surface-300 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-surface-500 text-xs italic pl-9">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary-600" />
                Hero is thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Chips */}
          <div className="px-3 py-2 bg-surface-100 dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 flex gap-1.5 overflow-x-auto no-scrollbar">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-surface-700 border border-surface-300 dark:border-surface-600 text-xs text-surface-700 dark:text-surface-300 hover:border-primary-500 hover:text-primary-600 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white dark:bg-surface-900 border-t border-surface-200 dark:border-surface-700 flex items-center gap-2">
            <button
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200'
              }`}
              title="Voice Input"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('typeOrSpeakPlaceholder', 'Ask Hero about queue, slots, crop...')}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
