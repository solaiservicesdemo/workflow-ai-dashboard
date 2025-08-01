import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MessageCircle,
  CheckSquare,
  Settings,
  TrendingUp,
  CheckCircle,
  XCircle,
  BarChart3,
  Plus,
  FileText,
  Link,
  Send,
  Paperclip,
  Mic,
  Globe,
  MessageSquare,
  Database,
  FolderOpen,
  X,
  Maximize2,
  Minimize2,
  CalendarDays,
} from "lucide-react";
import Header from "../components/Header";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

export default function Index() {
  const [inputMessage, setInputMessage] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const navigate = useNavigate();
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
        type: "bot" as const,
        content:
          "Hello! I'm AirWrecka, your AI real estate assistant. I can help you with property searches, lead qualification, market analysis, and more. How can I assist you today?",
        timestamp: "9:30 AM",
      },
    ];
  };

  const [messages, setMessages] = useState(getInitialMessages);

  const chatSectionRef = useRef<HTMLElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

  // Function to save messages to localStorage
  const saveMessages = (newMessages: typeof messages) => {
    localStorage.setItem("solai-chat-messages", JSON.stringify(newMessages));
    setMessages(newMessages);
  };

  const scrollToBottom = () => {
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: "user" as const,
        content: inputMessage,
        timestamp: "Just now",
      };

      const updatedMessages = [...messages, newMessage];
      saveMessages(updatedMessages);
      setInputMessage("");

      // Scroll to chat section (a bit lower) and chat to bottom
      setTimeout(() => {
        if (chatSectionRef.current) {
          const offset = 35; // adjust this value as needed for your layout
          const rect = chatSectionRef.current.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          window.scrollTo({
        top: rect.top + scrollTop - offset,
        behavior: "smooth",
          });
        }
        scrollToBottom();
      }, 100);

      // Simulate AI response
      setTimeout(async () => {
        try {
          const res = await fetch(
            "https://solaiservicesdemo.app.n8n.cloud/webhook/chat",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                message: newMessage.content,
                sessionId: sessionId,
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
            content: data.reply || "No response from assistant.",
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
        } catch (error) {
          console.error("Webhook fetch error:", error);

          let errorMessage =
            "Sorry, I'm having trouble connecting to the AI service right now. Please try again in a moment.";

          if (
            error instanceof TypeError &&
            error.message === "Failed to fetch"
          ) {
            errorMessage =
              "Unable to connect to the AI service. Please check your internet connection and try again.";
          } else if (error instanceof Error) {
            errorMessage = `AI service error: ${error.message}`;
          }

          const aiResponse = {
            id: newMessage.id + 1,
            type: "bot" as const,
            content: errorMessage,
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
        }
        // Scroll chat to bottom after AI response
        setTimeout(scrollToBottom, 100);
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSpeechToText = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    setIsRecording(true);

    recognition.onstart = () => {
      console.log("Speech recognition started");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage((prev) => prev + (prev ? " " : "") + transcript);
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const goToFullScreenChat = () => {
    navigate("/ai-chat");
  };
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

      {/* Hero Section */}
      <section className="text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      </section>

      {/* Services Section */}
      <section className="text-white dark:text-white py-5 px-0 pb-2 sm:pb-8 -mb-px lg:pt-20 pt-7 lg:-mt-0 -mt-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sm:-mb-1">
          <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
            {/* Telegram */}
            <a
              href="https://telegram.org"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center p-4 bg-white/20 dark:bg-gray-900 backdrop-blur-lg rounded-xl hover:bg-white/30 dark:hover:bg-gray-800 border border-white/30 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-white/20 dark:hover:shadow-white/10 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg mb-2">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-center text-white">
                Telegram
              </h3>
            </a>

            {/* Gmail */}
            <a
              href="https://gmail.com"
              className="group flex flex-col items-center p-4 bg-white/20 dark:bg-gray-900 backdrop-blur-lg rounded-xl hover:bg-white/30 dark:hover:bg-gray-800 border border-white/30 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-white/20 dark:hover:shadow-white/10 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg mb-2">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-center text-white">
                Gmail
              </h3>
            </a>

            {/* X (formerly Twitter) */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center p-4 bg-white/20 dark:bg-gray-900 backdrop-blur-lg rounded-xl hover:bg-white/30 dark:hover:bg-gray-800 border border-white/30 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-white/20 dark:hover:shadow-white/10 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-black rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg mb-2">
                <X className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-center text-white">
                X
              </h3>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center p-4 bg-white/20 dark:bg-gray-900 backdrop-blur-lg rounded-xl hover:bg-white/30 dark:hover:bg-gray-800 border border-white/30 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-white/20 dark:hover:shadow-white/10 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg mb-2">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-center text-white">
                Instagram
              </h3>
            </a>

            {/* My Website */}
            <a
              href="https://www.mercedesestrada.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center p-4 bg-white/20 dark:bg-gray-900 backdrop-blur-lg rounded-xl hover:bg-white/30 dark:hover:bg-gray-800 border border-white/30 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-white/20 dark:hover:shadow-white/10 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg mb-2">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-center text-white">
                My Website
              </h3>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center p-4 bg-white/20 dark:bg-gray-900 backdrop-blur-lg rounded-xl hover:bg-white/30 dark:hover:bg-gray-800 border border-white/30 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-white/20 dark:hover:shadow-white/10 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg mb-2">
                <Facebook className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-center text-white">
                Facebook
              </h3>
            </a>

            {/* Supabase */}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center p-4 bg-white/20 dark:bg-gray-900 backdrop-blur-lg rounded-xl hover:bg-white/30 dark:hover:bg-gray-800 border border-white/30 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-white/20 dark:hover:shadow-white/10 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg mb-2">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-center text-white">
                Supabase
              </h3>
            </a>

            {/* Google Drive */}
            <a
              href="https://drive.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center p-4 bg-white/20 dark:bg-gray-900 backdrop-blur-lg rounded-xl hover:bg-white/30 dark:hover:bg-gray-800 border border-white/30 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-white/20 dark:hover:shadow-white/10 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg mb-2">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-center text-white">
                Google Drive
              </h3>
            </a>
            {/* Google Calendar */}
            <a
              href="https://calendar.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center p-4 bg-white/20 dark:bg-gray-900 backdrop-blur-lg rounded-xl hover:bg-white/30 dark:hover:bg-gray-800 border border-white/30 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-white/20 dark:hover:shadow-white/10 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg mb-2">
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-center text-white">
                Google Calendar
              </h3>
            </a>
          </div>
        </div>
      </section>

      {/* Analytics & Recent Activities Section */}
      <section className="text-white dark:text-white py-6 pt-6 pb-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-0">
          {/* Three Equal Columns Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Column 1: Notifications */}
            <div className="lg:col-span-1">
              <div className="bg-white/20 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-6 border border-white/30 dark:border-gray-700 h-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">Notifications</h3>
                  <button className="text-solai-blue hover:text-solai-blue-dark text-sm font-medium">
                    View All
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">Email Campaign Workflow</p>
                      <p className="text-sm text-white/70">
                        Completed successfully
                      </p>
                      <p className="text-xs text-white/50">2 mins ago</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">Data Sync Process</p>
                      <p className="text-sm text-white/70">
                        Retrying connection...
                      </p>
                      <p className="text-xs text-white/50">5 mins ago</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">Report Generation</p>
                      <p className="text-sm text-white/70">
                        PDF generated and sent
                      </p>
                      <p className="text-xs text-white/50">10 mins ago</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">API Integration</p>
                      <p className="text-sm text-white/70">
                        Connection timeout
                      </p>
                      <p className="text-xs text-white/50">15 mins ago</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">Social Media Post</p>
                      <p className="text-sm text-white/70">
                        Published to all platforms
                      </p>
                      <p className="text-xs text-white/50">20 mins ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Workflow Analytics */}
            <div className="lg:col-span-1">
              <div className="bg-white/20 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-6 border border-white/30 dark:border-gray-700 h-full">
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-2 text-purple-400" />
                  Workflow Analytics
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-solai-blue" />
                      <span className="text-2xl font-bold">12</span>
                    </div>
                    <p className="text-sm text-white/70">Active Workflows</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-2xl font-bold">847</span>
                    </div>
                    <p className="text-sm text-white/70">Successful Runs</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <XCircle className="w-5 h-5 text-red-400" />
                      <span className="text-2xl font-bold">23</span>
                    </div>
                    <p className="text-sm text-white/70">Failed Runs</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                      <span className="text-2xl font-bold">97.4%</span>
                    </div>
                    <p className="text-sm text-white/70">Success Rate</p>
                  </div>
                </div>

                {/* Execution Frequency Chart */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">
                    Execution Frequency (Last 7 Days)
                  </h4>
                  <div className="flex items-end justify-between h-20 space-x-1">
                    <div className="bg-gradient-to-t from-purple-500 to-purple-300 w-6 h-8 rounded-t"></div>
                    <div className="bg-gradient-to-t from-purple-500 to-purple-300 w-6 h-12 rounded-t"></div>
                    <div className="bg-gradient-to-t from-purple-500 to-purple-300 w-6 h-16 rounded-t"></div>
                    <div className="bg-gradient-to-t from-purple-500 to-purple-300 w-6 h-20 rounded-t"></div>
                    <div className="bg-gradient-to-t from-purple-500 to-purple-300 w-6 h-14 rounded-t"></div>
                    <div className="bg-gradient-to-t from-purple-500 to-purple-300 w-6 h-18 rounded-t"></div>
                    <div className="bg-gradient-to-t from-purple-500 to-purple-300 w-6 h-10 rounded-t"></div>
                  </div>
                  <div className="flex justify-between text-xs text-white/50 mt-2">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Market Analysis */}
            <div className="lg:col-span-1">
              <div className="bg-white/20 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-6 border border-white/30 dark:border-gray-700 h-full">
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2 text-green-400" />
                  Market Analysis
                </h3>

                <div className="space-y-4">
                  {/* Breaking News Item */}
                  <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-lg p-4 relative overflow-hidden">
                    <div className="absolute top-2 right-2">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                        LIVE
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-white text-sm">
                          AI Marketing Revolution
                        </h4>
                        <p className="text-white/80 text-xs mt-1">
                          ChatGPT integration drives 340% increase in conversion
                          rates for e-commerce platforms
                        </p>
                        <p className="text-white/60 text-xs mt-2">2 mins ago</p>
                      </div>
                    </div>
                  </div>

                  {/* Trending Topic */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <BarChart3 className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-white text-sm">
                          Social Media Analytics
                        </h4>
                        <p className="text-white/80 text-xs mt-1">
                          Instagram Reels outperforming TikTok in B2B engagement
                          by 25%
                        </p>
                        <p className="text-white/60 text-xs mt-2">
                          15 mins ago
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Market Insight */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-white text-sm">
                          Email Marketing Trends
                        </h4>
                        <p className="text-white/80 text-xs mt-1">
                          Personalized subject lines boost open rates by 50% in
                          Q1 2024
                        </p>
                        <p className="text-white/60 text-xs mt-2">1 hour ago</p>
                      </div>
                    </div>
                  </div>

                  {/* Hot Take */}
                  <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Globe className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-white text-sm">
                          Global Ad Spending
                        </h4>
                        <p className="text-white/80 text-xs mt-1">
                          Digital advertising to reach $1.2T globally, mobile
                          captures 75% share
                        </p>
                        <p className="text-white/60 text-xs mt-2">
                          3 hours ago
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Market Indicators */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-xs">
                    <div className="text-center">
                      <div className="text-green-400 font-bold">↗ +12.5%</div>
                      <div className="text-white/60">Ad Spend</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-400 font-bold">↗ +8.3%</div>
                      <div className="text-white/60">CTR</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-400 font-bold">↗ +15.7%</div>
                      <div className="text-white/60">ROI</div>
                    </div>
                    <div className="text-center">
                      <div className="text-orange-400 font-bold">↗ +22.1%</div>
                      <div className="text-white/60">Engagement</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Section */}
      <section ref={chatSectionRef} className="text-white pb-6 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:-mb-0 -mb-0.5 lg:pt-0 pt-12 mt-5 sm:mt-5 -mt-1 sm:mt-5 pt-18 sm:pt-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 text-center">
            AI Assistant Chat
          </h2>

          <div className="bg-white/20 dark:bg-gray-900 backdrop-blur-lg rounded-2xl p-6 border border-white/30 dark:border-gray-700 max-w-4xl mx-auto lg:-mt-0 -mt-1 mt-4 sm:-mt-1 lg:pt-6 pt-7 pt-5 sm:pt-7 relative">
            {/* Chat Header */}
            <div
              onClick={goToFullScreenChat}
              className="flex items-center justify-between pb-4 border-b border-white/20 mb-6 cursor-pointer hover:bg-white/5 rounded-lg p-2 -m-2 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-solai-blue to-cyan-400 rounded-full flex items-center justify-center">
                  {isVoiceMode ? (
                    <Mic className="w-6 h-6 text-white" />
                  ) : (
                    <MessageCircle className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    SOLAI AI{" "}
                    {isVoiceMode ? "Voice Assistant" : "Chat Assistant"}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-white/70">Online</span>
                  </div>
                </div>
              </div>

              {/* Header Controls */}
              <div className="flex items-center space-x-4">
                {/* Voice Mode Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsVoiceMode(!isVoiceMode);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isVoiceMode
                      ? "bg-solai-blue text-white shadow-lg"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  Voice Mode
                </button>

                {/* Fullscreen Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToFullScreenChat();
                  }}
                  className="w-8 sm:w-8 w-11 h-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 border border-white/20 text-white hover:text-white"
                  title="Open full screen chat"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={messagesContainerRef}
              className="h-96 overflow-y-auto space-y-4 mb-6"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-start space-x-3 max-w-[80%] ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === "user" ? "bg-gradient-to-br from-solai-blue to-solai-blue-dark" : "bg-gradient-to-br from-purple-500 via-solai-blue to-cyan-400"}`}
                    >
                      {message.type === "user" ? (
                        <span className="text-white text-xs font-bold">U</span>
                      ) : (
                        <MessageCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-3 ${message.type === "user" ? "bg-gradient-to-br from-solai-blue to-solai-blue-dark" : "bg-white/10 backdrop-blur-sm border border-white/20"}`}
                    >
                      <p className="text-sm leading-relaxed text-white">
                        {message.content}
                      </p>
                      <p className="text-xs text-white/70 mt-1">
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Fixed Bottom Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-lg border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 focus-within:border-solai-blue/50 transition-colors">
              <div className="flex items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    isVoiceMode
                      ? "Click mic to start voice input..."
                      : "Type your message to AI Assistant..."
                  }
                  className="flex-1 bg-transparent text-white placeholder-white/50 px-6 py-4 rounded-2xl focus:outline-none text-base"
                  disabled={isVoiceMode}
                />
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
                <button
                  className="p-2 text-white/70 hover:text-white transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              </div>
            </div>

            {isVoiceMode ? (
              <button
                onClick={handleSpeechToText}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-lg ${
                  isRecording
                    ? "bg-gradient-to-br from-red-600 to-red-700 animate-pulse"
                    : "bg-gradient-to-br from-red-500 to-red-600"
                }`}
                title={isRecording ? "Stop recording" : "Start voice recording"}
              >
                <Mic className="w-5 h-5 text-white" />
              </button>
            ) : (
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="w-12 h-12 bg-gradient-to-br from-solai-blue to-solai-blue-dark rounded-2xl flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-solai-dark text-white py-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">
                Empowering business professionals with <br />
                AI-driven solutions.
              </h3>
            </div>

            {/* Links Column 1 */}
            <div className="space-y-4">
              <h4 className="font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-solai-blue transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-solai-blue transition-colors"
                  >
                    Accessibility Statement
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-solai-blue transition-colors"
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-solai-blue transition-colors"
                  >
                    Refund Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="font-semibold">Contact</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>solaiservicesdemo@gmail.com.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>619-519-4346</span>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4"></div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>
              © 2035 by SOLAI AI Assistant Services. Powered and secured by{" "}
              <span className="underline">Wix</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
