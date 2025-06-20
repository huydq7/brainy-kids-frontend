"use client";
import React, { useState } from "react";
import ChatInterface from "./ChatInterface";
import { MessageCircle, X, Sparkles } from "lucide-react";

interface Message {
  text: string;
  sender: "user" | "bot";
  icon?: string;
  type?: "welcome" | "normal";
}

const ChatbotPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleChatbot}
        />
      )}

      <div className="fixed bottom-4 right-4 z-50">
        {isOpen && (
          <div className="fixed md:absolute bottom-0 right-0 md:bottom-20 md:right-0 bg-white dark:bg-gray-900 rounded-t-3xl md:rounded-2xl shadow-2xl w-full h-[80vh] md:w-[380px] md:h-[600px] flex flex-col overflow-hidden border-t md:border border-gray-100 dark:border-gray-800">
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white p-3 md:p-4 flex justify-between items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="absolute -top-4 -left-4 w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-full blur-lg"></div>

              <div className="flex items-center gap-2 md:gap-3 relative z-10">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold">
                    Trợ lý tiếng Anh
                  </h2>
                  <p className="text-[10px] md:text-xs text-white/80">
                    English Learning Assistant
                  </p>
                </div>
              </div>
              <button
                onClick={toggleChatbot}
                className="relative z-10 text-white/80 hover:text-white hover:bg-white/10 p-1.5 md:p-2 rounded-full transition-all duration-200 hover:scale-110"
              >
                <X className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </div>

            <div className="flex-grow overflow-hidden bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-900 dark:to-gray-800">
              <ChatInterface messages={messages} setMessages={setMessages} />
            </div>
          </div>
        )}

        <button
          onClick={toggleChatbot}
          className={`group bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-full p-3 md:p-4 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 relative overflow-hidden ${
            isOpen ? "hidden" : "block"
          }`}
        >
          <div className="absolute inset-0 bg-white/20 rounded-full blur-sm group-hover:bg-white/30 transition-all duration-300"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-full"></div>

          <div className="relative z-10 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 md:h-6 md:w-6 group-hover:scale-110 transition-transform duration-200" />

            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full animate-pulse border-2 border-white"></div>
          </div>

          <div className="absolute bottom-full right-0 mb-2 px-2.5 py-1 bg-gray-900 text-white text-[10px] md:text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Học tiếng Anh cùng mình nhé! 😊
            <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      </div>
    </>
  );
};

export default ChatbotPopup;
