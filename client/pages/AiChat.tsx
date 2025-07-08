import {
  ArrowLeft,
  Send,
  Bot,
  User,
  Sparkles,
  MessageCircle,
  Settings,
  Paperclip,
  File,
  X,
  Mic,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Header from "../components/Header";

export default function AiChat() {
  const [message, setMessage] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDark, setIsDark] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I'm your AI Assistant. How can I help you with your business processes today?",
      timestamp: "9:30 AM",
    },
    {
      id: 2,
      type: "user",
      content:
        "I need help setting up an automated email campaign for our new product launch.",
      timestamp: "9:32 AM",
    },
    {
      id: 3,
      type: "bot",
      content:
        "I'd be happy to help you set up an automated email campaign! Let me guide you through the process. First, could you tell me about your target audience and the key messaging you want to include?",
      timestamp: "9:32 AM",
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    // Watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSendMessage = async () => {
    if (message.trim() || uploadedFiles.length > 0) {
      const newMessage = {
        id: messages.length + 1,
        type: "user" as const,
        content: message,
        files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
  
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
      setUploadedFiles([]);
  
      try {
        const res = await fetch("https://solaiservicesdemo.app.n8n.cloud/webhook/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: newMessage.content }),
        });
  
        const data = await res.json();
  
        const aiResponse = {
          id: newMessage.id + 1,
          type: "bot" as const,
          content: data.reply || "No response from assistant.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
  
        setMessages((prev) => [...prev, aiResponse]);
      } catch (err) {
        console.error(err);
        setMessages((prev) => [
          ...prev,
          {
            id: newMessage.id + 1,
            type: "bot" as const,
            content: "Error contacting assistant.",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }
    }
  };
  

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  function handleSpeechToText(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage((prev) => prev ? prev + " " + transcript : transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  }
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-blue-500 via-blue-300 to-blue-900 dark:from-black dark:via-gray-900 dark:to-black"
      style={{
        background: isDark
          ? "linear-gradient(to bottom, rgb(0, 0, 0), rgb(31, 41, 55), rgb(0, 0, 0))"
          : "linear-gradient(to bottom, rgb(10, 88, 138), rgb(147, 197, 253), rgb(10, 88, 138))",
      }}
    >
      <Header />

      {/* Page-specific header */}
      <div className="bg-black/40 dark:bg-black/40 backdrop-blur-lg border-b border-white/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Back Button */}
            <a
              href="/"
              className="flex items-center space-x-2 text-white hover:text-solai-blue transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Dashboard</span>
            </a>

            {/* Settings */}
            <div className="flex items-center space-x-4">
              <button className="text-white hover:text-solai-blue transition-colors"></button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/20 dark:bg-black/30 backdrop-blur-lg rounded-2xl border border-white/30 dark:border-white/10 h-[calc(100vh-240px)] flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20 dark:border-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-solai-blue to-cyan-400 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  SOLAI AI Assistant
                </h3>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-white/70">Online</span>
                </div>
              </div>
            </div>

            {/* Voice Mode Button */}
            <button
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isVoiceMode
                  ? "bg-solai-blue text-white shadow-lg"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              Voice Mode
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex items-start space-x-3 max-w-[80%] ${
                    msg.type === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.type === "user"
                        ? "bg-gradient-to-br from-solai-blue to-solai-blue-dark"
                        : "bg-gradient-to-br from-purple-500 via-solai-blue to-cyan-400"
                    }`}
                  >
                    {msg.type === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.type === "user"
                        ? "bg-gradient-to-br from-solai-blue to-solai-blue-dark text-white"
                        : "bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10 text-white"
                    }`}
                  >
                    {msg.content && (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}

                    {/* Display uploaded files */}
                    {(msg as any).files && (
                      <div className="mt-2 space-y-2">
                        {(msg as any).files.map(
                          (file: File, fileIndex: number) => (
                            <div
                              key={fileIndex}
                              className="flex items-center space-x-2 bg-white/20 dark:bg-black/20 rounded-lg p-2"
                            >
                              <File className="w-4 h-4 text-white/70" />
                              <span className="text-xs text-white/90 truncate">
                                {file.name}
                              </span>
                              <span className="text-xs text-white/60">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    )}

                    <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-white/20 dark:border-white/5">
            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-sm text-white/70">Attached files:</p>
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20 dark:border-white/10"
                    >
                      <File className="w-4 h-4 text-white/70" />
                      <span className="text-sm text-white/90 truncate max-w-32">
                        {file.name}
                      </span>
                      <span className="text-xs text-white/60">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-white/50 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-end space-x-3">
              <div className="flex-1 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-white/10 focus-within:border-solai-blue/50 transition-colors">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    isVoiceMode
                      ? "Click mic to start voice input..."
                      : "Type your message here..."
                  }
                  className="w-full bg-transparent text-white placeholder-white/50 px-4 py-3 rounded-2xl resize-none focus:outline-none"
                  rows={1}
                  style={{ minHeight: "44px", maxHeight: "120px" }}
                  disabled={isVoiceMode}
                />
              </div>
              <button
                onClick={handleSpeechToText}
                className={`p-2 transition-colors ${
                  isRecording
                    ? "text-red-400 hover:text-red-300 animate-pulse"
                    : "text-white/70 hover:text-white"
                }`}
                title={
                  isRecording ? "Stop recording" : "Start speech-to-text"
                }
              >
                <Mic className="w-5 h-5" />
              </button>
              {/* File Upload Button */}
              <button
                onClick={triggerFileUpload}
                className="w-11 h-11 bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 dark:hover:bg-black/30 transition-all duration-200 border border-white/20 dark:border-white/10"
              >
                <Paperclip className="w-5 h-5 text-white/70" />
              </button>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.jpg,.jpeg,.png,.gif"
              />

              {isVoiceMode ? (
                <button
                  className="w-11 h-11 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-lg"
                  title="Start voice recording"
                >
                  <Mic className="w-5 h-5 text-white" />
                </button>
              ) : (
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() && uploadedFiles.length === 0}
                  className="w-11 h-11 bg-gradient-to-br from-solai-blue to-solai-blue-dark rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button className="px-3 py-1.5 bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-full text-xs text-white/80 hover:bg-white/20 dark:hover:bg-black/30 transition-colors border border-white/20 dark:border-white/10">
                <Sparkles className="w-3 h-3 inline mr-1" />
                Generate Email Template
              </button>
              <button className="px-3 py-1.5 bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-full text-xs text-white/80 hover:bg-white/20 dark:hover:bg-black/30 transition-colors border border-white/20 dark:border-white/10">
                <MessageCircle className="w-3 h-3 inline mr-1" />
                Create Workflow
              </button>
              <button className="px-3 py-1.5 bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-full text-xs text-white/80 hover:bg-white/20 dark:hover:bg-black/30 transition-colors border border-white/20 dark:border-white/10">
                📊 Analytics Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
