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

// Generate UUID v4
const generateUUID = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for browsers without crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function AiChat() {
  const [message, setMessage] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [professionalMode, setProfessionalMode] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDark, setIsDark] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [selectedTool, setSelectedTool] = useState<string>("general");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize messages from localStorage or use default
  const getInitialMessages = () => {
    const savedMessages = localStorage.getItem("solai-chat-messages");
    if (savedMessages) {
      try {
        return JSON.parse(savedMessages);
      } catch (error) {
        console.error("Error parsing saved messages:", error);
      }
    }
    // Default messages if none saved
    return [
      {
        id: 1,
        type: "bot",
        content:
          "Hello! I'm AirWrecka, your AI real estate assistant. I can help you with property searches, lead qualification, market analysis, and more. How can I assist you today?",
        timestamp: "9:30 AM",
      },
    ];
  };

  const [messages, setMessages] = useState(getInitialMessages);

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

  // Session management
  useEffect(() => {
    // Check if this is a page refresh/fresh load
    const isPageRefresh = !sessionStorage.getItem("solai-navigation-flag");

    if (isPageRefresh) {
      // Clear existing session and messages on page refresh
      localStorage.removeItem("solai-chat-session");
      localStorage.removeItem("solai-chat-messages");

      // Reset messages to default
      const defaultMessages = getInitialMessages();
      setMessages(defaultMessages);
    }

    // Set navigation flag for future page loads
    sessionStorage.setItem("solai-navigation-flag", "true");

    // Initialize or get existing session
    const initializeSession = () => {
      let existingSessionId = localStorage.getItem("solai-chat-session");
      if (!existingSessionId) {
        existingSessionId = generateUUID();
        localStorage.setItem("solai-chat-session", existingSessionId);
      }
      setSessionId(existingSessionId);
    };

    initializeSession();

    // Reset activity timeout
    const resetActivityTimeout = () => {
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }

      // Clear session after 30 minutes of inactivity
      activityTimeoutRef.current = setTimeout(
        () => {
          localStorage.removeItem("solai-chat-session");
          localStorage.removeItem("solai-chat-messages");
          const newSessionId = generateUUID();
          setSessionId(newSessionId);
          localStorage.setItem("solai-chat-session", newSessionId);
          // Reset to default messages
          const defaultMessages = getInitialMessages();
          setMessages(defaultMessages);
        },
        30 * 60 * 1000,
      ); // 30 minutes
    };

    // Set up activity listeners
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    const resetTimeout = () => resetActivityTimeout();

    events.forEach((event) => {
      document.addEventListener(event, resetTimeout, true);
    });

    resetActivityTimeout();

    // Cleanup on page unload
    const handleBeforeUnload = () => {
      localStorage.removeItem("solai-chat-session");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimeout, true);
      });
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, [sessionId]);

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

      setMessages((prev) => {
        const newMessages = [...prev, newMessage];
        localStorage.setItem(
          "solai-chat-messages",
          JSON.stringify(newMessages),
        );
        return newMessages;
      });
      setMessage("");
      setUploadedFiles([]);
      setSelectedTool("general"); // Reset tool selection after sending

      try {
        const res = await fetch(
          "https://solaiservicesdemo.app.n8n.cloud/webhook/assistant-pr-v2",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              message: newMessage.content,
              sessionId: sessionId,
              clientId: sessionId,
              professionalMode: professionalMode,
              voiceMode: isVoiceMode,
              selectedTool: selectedTool,
              ...(uploadedFiles.length > 0 && { 
                files: uploadedFiles.map(file => ({
                  filename: file.name,
                  size: file.size,
                  type: file.type
                }))
              })
            }),
          },
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        const aiResponse = {
          id: newMessage.id + 1,
          type: "bot" as const,
          content: data.response || data.reply || "No response from assistant.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages((prev) => {
          const newMessages = [...prev, aiResponse];
          localStorage.setItem(
            "solai-chat-messages",
            JSON.stringify(newMessages),
          );
          return newMessages;
        });
      } catch (err) {
        console.error("Webhook fetch error:", err);

        let errorMessage =
          "Sorry, I'm having trouble connecting to the AI service right now. Please try again in a moment.";

        if (err instanceof TypeError && err.message === "Failed to fetch") {
          errorMessage =
            "Unable to connect to the AI service. Please check your internet connection and try again.";
        } else if (err instanceof Error) {
          errorMessage = `AI service error: ${err.message}`;
        }

        setMessages((prev) => {
          const newMessages = [
            ...prev,
            {
              id: newMessage.id + 1,
              type: "bot" as const,
              content: errorMessage,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ];
          localStorage.setItem(
            "solai-chat-messages",
            JSON.stringify(newMessages),
          );
          return newMessages;
        });
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

  function handleSpeechToText(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage((prev) => (prev ? prev + " " + transcript : transcript));
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
                  AirWrecka AI Assistant
                </h3>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-white/70">
                    {professionalMode ? "Professional Mode" : "General Mode"}
                  </span>
                </div>
              </div>
            </div>

            {/* Mode Toggle Buttons */}
            <div className="flex items-center space-x-3">
              {/* Professional Mode Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white/70">General</span>
                <button
                  onClick={() => setProfessionalMode(!professionalMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                    professionalMode 
                      ? "bg-gradient-to-r from-solai-blue to-solai-blue-dark" 
                      : "bg-white/20"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      professionalMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm text-white/70">Professional</span>
              </div>

              {/* Voice Mode Button */}
              <button
                onClick={() => setIsVoiceMode(!isVoiceMode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isVoiceMode
                    ? "bg-red-500 text-white shadow-lg"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                {isVoiceMode ? "🎤 Voice" : "💬 Text"}
              </button>
            </div>
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
                title={isRecording ? "Stop recording" : "Start speech-to-text"}
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

            {/* Selected Tool Indicator */}
            {selectedTool !== "general" && (
              <div className="flex items-center justify-between bg-solai-blue/20 border border-solai-blue/30 rounded-lg px-3 py-2 mt-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-white/90">Tool selected:</span>
                  <span className="text-xs font-medium text-white capitalize">{selectedTool}</span>
                </div>
                <button
                  onClick={() => setSelectedTool("general")}
                  className="text-white/60 hover:text-white transition-colors"
                  title="Clear tool selection"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              {professionalMode ? (
                <>
                  <button
                    onClick={() => {
                      setMessage("Find luxury properties in Coronado under $4M");
                      setSelectedTool("database");
                    }}
                    className={`px-3 py-1.5 backdrop-blur-sm rounded-full text-xs transition-colors border ${
                      selectedTool === "database"
                        ? "bg-solai-blue/30 border-solai-blue text-white"
                        : "bg-white/10 dark:bg-black/20 border-white/20 dark:border-white/10 text-white/80 hover:bg-white/20 dark:hover:bg-black/30"
                    }`}
                  >
                    🗄️ Search Database
                  </button>
                  <button
                    onClick={() => {
                      setMessage("Check my calendar for available appointment slots");
                      setSelectedTool("calendar");
                    }}
                    className={`px-3 py-1.5 backdrop-blur-sm rounded-full text-xs transition-colors border ${
                      selectedTool === "calendar"
                        ? "bg-solai-blue/30 border-solai-blue text-white"
                        : "bg-white/10 dark:bg-black/20 border-white/20 dark:border-white/10 text-white/80 hover:bg-white/20 dark:hover:bg-black/30"
                    }`}
                  >
                    📅 Calendar
                  </button>
                  <button
                    onClick={() => {
                      setMessage("Compose an email to follow up with a lead");
                      setSelectedTool("email");
                    }}
                    className={`px-3 py-1.5 backdrop-blur-sm rounded-full text-xs transition-colors border ${
                      selectedTool === "email"
                        ? "bg-solai-blue/30 border-solai-blue text-white"
                        : "bg-white/10 dark:bg-black/20 border-white/20 dark:border-white/10 text-white/80 hover:bg-white/20 dark:hover:bg-black/30"
                    }`}
                  >
                    📧 Send an Email
                  </button>
                  <button
                    onClick={() => {
                      setMessage("Search the web for current market trends");
                      setSelectedTool("web");
                    }}
                    className={`px-3 py-1.5 backdrop-blur-sm rounded-full text-xs transition-colors border ${
                      selectedTool === "web"
                        ? "bg-solai-blue/30 border-solai-blue text-white"
                        : "bg-white/10 dark:bg-black/20 border-white/20 dark:border-white/10 text-white/80 hover:bg-white/20 dark:hover:bg-black/30"
                    }`}
                  >
                    🔍 Web Search
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setMessage("How's the weather today?")}
                    className="px-3 py-1.5 bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-full text-xs text-white/80 hover:bg-white/20 dark:hover:bg-black/30 transition-colors border border-white/20 dark:border-white/10"
                  >
                    ��️ Weather
                  </button>
                  <button 
                    onClick={() => setMessage("Tell me a joke")}
                    className="px-3 py-1.5 bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-full text-xs text-white/80 hover:bg-white/20 dark:hover:bg-black/30 transition-colors border border-white/20 dark:border-white/10"
                  >
                    😄 Tell a Joke
                  </button>
                  <button 
                    onClick={() => setMessage("What's interesting in the news?")}
                    className="px-3 py-1.5 bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-full text-xs text-white/80 hover:bg-white/20 dark:hover:bg-black/30 transition-colors border border-white/20 dark:border-white/10"
                  >
                    📰 News
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
