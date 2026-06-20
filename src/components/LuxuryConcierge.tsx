/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, ArrowRight, User, ShieldCheck } from 'lucide-react';
import { Product } from '../types';

interface LuxuryConciergeProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  setView: (view: string) => void;
}

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export default function LuxuryConcierge({
  products,
  onSelectProduct,
  setView
}: LuxuryConciergeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: "Bonsoir. It is an absolute privilege to assist you at the JB Store. I am Jean-Baptiste, your dedicated Maison stylist.\n\nAre we curating an exceptional automatic skeleton watch, handcrafted Chelsea boots, a double cashmere biker jacket, or perhaps finding your private signature scent?"
    }
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isBotTyping]);

  // Handle send
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isBotTyping) return;

    const userMsg = inputVal.trim();
    setInputVal('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setIsBotTyping(true);

    // Call server API which proxies Gemini securely
    fetch('/api/concierge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMsg,
        chatHistory: chatHistory.slice(-6) // Send context
      })
    })
      .then(res => res.json())
      .then(data => {
        setChatHistory(prev => [...prev, { sender: 'bot', text: data.reply || 'Apologies, our private line is processing other guests. I will be with you momentarily.' }]);
      })
      .catch(err => {
        console.error('Concierge API Error:', err);
        setChatHistory(prev => [...prev, { sender: 'bot', text: 'An exquisite delay occurred in our transmission line. I suggest exploring our Watches Collection or Elixir Parfums directly.' }]);
      })
      .finally(() => {
        setIsBotTyping(false);
      });
  };

  const handleShortcutClick = (text: string) => {
    setInputVal(text);
  };

  const tryNavigateToSkus = (word: string) => {
    const term = word.toLowerCase();
    const match = products.find(p => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term));
    if (match) {
      onSelectProduct(match);
      setView('product');
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" id="luxury-concierge-suite">
      
      {/* Floating Glowing Sparkle Button Orb */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-tr from-black via-zinc-900 to-zinc-950 text-gold-400 hover:text-black hover:from-gold-500 hover:to-gold-600 border border-gold-500/40 hover:border-gold-400 transition-all duration-300 shadow-2xl flex items-center justify-center cursor-pointer group hover:scale-105 active:scale-95 animate-pulse"
          title="Summon Jean-Baptiste Concierge"
          id="concierge-summon-orb"
        >
          <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform duration-500" />
          <span className="absolute right-15 scale-0 group-hover:scale-100 transition-all duration-150 text-[10px] bg-black text-gold-400 border border-gold-800/35 font-serif px-2.5 py-1 rounded-md tracking-widest uppercase shrink-0 font-bold">
            Jean-Baptiste
          </span>
        </button>
      )}

      {/* Expanded Stylist Drawer */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-black border border-gold-800/35 rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-between animate-in zoom-in-95 slide-in-from-bottom duration-300">
          
          {/* Header */}
          <div className="p-4 bg-zinc-950 border-b border-gold-800/15 flex justify-between items-center text-white">
            <div className="flex items-center space-x-2.5">
              <div className="h-9 w-9 rounded-full bg-gold-900/40 border border-gold-500/50 flex items-center justify-center text-gold-400 font-serif font-black uppercase text-xs">
                JB
              </div>
              <div className="text-left">
                <span className="text-[9px] uppercase tracking-widest text-gold-500 block">Maison Butler</span>
                <h3 className="text-xs font-serif tracking-wider uppercase font-semibold">Jean-Baptiste</h3>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-zinc-500 hover:text-white transition-colors"
              id="concierge-close-btn"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Window */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/20 max-h-[300px]">
            {chatHistory.map((m, id) => (
              <div 
                key={id}
                className={`flex items-start space-x-2 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                  m.sender === 'user' ? 'bg-zinc-800 text-zinc-300' : 'bg-gold-950 text-gold-400 border border-gold-800/20'
                }`}>
                  {m.sender === 'user' ? <User className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                </div>
                
                <div className={`p-3 rounded-xl text-xs leading-relaxed max-w-[80%] whitespace-pre-wrap ${
                  m.sender === 'user' 
                    ? 'bg-zinc-900 text-white font-sans' 
                    : 'bg-[#141414] text-zinc-100 border border-gold-800/10 font-serif'
                }`}>
                  {m.text}
                  
                  {/* Dynamic keyword link triggers */}
                  {m.sender === 'bot' && (
                    <div className="flex flex-wrap gap-1 mt-2.5 border-t border-zinc-900 pt-2 text-[9px] uppercase tracking-widest text-gold-400 font-sans">
                      <span>Examine:</span>
                      {['Royale', 'Oud', 'Chelsea', 'Obsidian'].map(k => (
                        <button
                          key={k}
                          onClick={() => tryNavigateToSkus(k)}
                          className="bg-zinc-900 hover:bg-gold-500 hover:text-black border border-gold-800/10 px-1 py-0.5 rounded transition-all"
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isBotTyping && (
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 rounded-full bg-gold-950 flex items-center justify-center shrink-0">
                  <Sparkles className="h-3 w-3 text-gold-400 animate-spin" />
                </div>
                <div className="bg-[#141414] text-zinc-400 p-3 rounded-xl text-xs font-serif flex items-center space-x-1.5 border border-gold-800/10">
                  <span>Styling concierge is drafting styles</span>
                  <span className="flex space-x-1">
                    <span className="h-1 w-1 bg-gold-500 rounded-full animate-bounce delay-100" />
                    <span className="h-1 w-1 bg-gold-500 rounded-full animate-bounce delay-200" />
                    <span className="h-1 w-1 bg-gold-500 rounded-full animate-bounce delay-300" />
                  </span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Shortcuts suggested Style inquiries */}
          {chatHistory.length < 3 && (
            <div className="px-4 py-2 bg-black border-t border-gold-800/10 flex flex-wrap gap-1.5">
              {[
                "Pairing a gold dial watch?",
                "What is the Cambodian Oud?",
                "Best sizing for Italian boots?"
              ].map(shortcut => (
                <button
                  key={shortcut}
                  onClick={() => handleShortcutClick(shortcut)}
                  className="bg-zinc-950 hover:bg-zinc-900 text-neutral-400 hover:text-gold-400 border border-gold-800/10 px-2 py-1 text-[9px] font-sans uppercase rounded tracking-wider transition-colors"
                >
                  {shortcut}
                </button>
              ))}
            </div>
          )}

          {/* Input Box Form */}
          <form onSubmit={handleSend} className="p-3 bg-zinc-950 border-t border-gold-800/15 flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Ask stylist Jean-Baptiste..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 bg-zinc-900 text-xs text-white border border-gold-800/20 rounded-lg px-3 py-2 outline-none focus:border-gold-500 placeholder-zinc-500"
              disabled={isBotTyping}
            />
            <button
              type="submit"
              className="p-2 bg-gold-500 hover:bg-gold-600 text-black rounded-lg transition-colors flex items-center justify-center shrink-0"
              disabled={isBotTyping}
              id="concierge-send-btn"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
