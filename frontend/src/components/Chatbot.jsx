// components/ChatBot.jsx
import { useState, useRef, useEffect } from "react";
import { chatbotLogic } from "../utils/ChatbotLogic";

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I’m OP Bot 👮‍♂️. Speak or type your message below!" }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaStreamRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputFieldRef = useRef(null);
  const fullTranscriptRef = useRef("");
  const isListeningRef = useRef(false);
  const silenceTimerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const transcribeAudioBlob = async (blob) => {
    try {
      setIsTranscribing(true);
      setStatusText("🤖 Transcribing audio with AI...");
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const audioBase64 = await base64Promise;

      const userApiKey = localStorage.getItem("groq_api_key") || localStorage.getItem("gemini_api_key") || "";
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/transcribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64, mimeType: blob.type || "audio/webm", apiKey: userApiKey })
      });

      const data = await res.json();
      if (data.ok && data.text) {
        return data.text.trim();
      }
      return null;
    } catch (err) {
      console.warn("Audio transcription error:", err);
      return null;
    } finally {
      setIsTranscribing(false);
    }
  };

  const cleanupVoiceResources = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch { /* ignore */ }
      mediaStreamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch { /* ignore */ }
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch { /* ignore */ }
      recognitionRef.current = null;
    }
  };

  const stopListening = async () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    isListeningRef.current = false;
    setIsListening(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch { /* ignore */ }
      recognitionRef.current = null;
    }

    let recordedBlob = null;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        const recorder = mediaRecorderRef.current;
        const stoppedPromise = new Promise((resolve) => {
          recorder.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
            resolve(blob);
          };
          recorder.stop();
        });
        recordedBlob = await stoppedPromise;
      } catch (e) {
        console.warn("Error stopping recorder:", e);
      }
    }

    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch { /* ignore */ }
      mediaStreamRef.current = null;
    }

    let captured = (inputFieldRef.current?.value || input || "").trim();

    // If WebSpeech was blocked by client/adblocker, transcribe the recorded audio
    if (!captured && recordedBlob && recordedBlob.size > 2000) {
      const aiText = await transcribeAudioBlob(recordedBlob);
      if (aiText) {
        captured = aiText;
      }
    }

    setStatusText("");

    if (captured) {
      // Put captured text in input box for review — do not auto-submit
      setInput(captured);
      fullTranscriptRef.current = captured;
      setTimeout(() => {
        inputFieldRef.current?.focus();
      }, 50);
    }
  };

  const startListening = async () => {
    cleanupVoiceResources();
    setStatusText("");
    setIsListening(true);
    isListeningRef.current = true;
    audioChunksRef.current = [];

    // 1. Capture microphone audio via MediaRecorder
    let userStream = null;
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = userStream;
      }
    } catch (micErr) {
      console.warn("Mic permission error:", micErr);
      setIsListening(false);
      isListeningRef.current = false;
      setStatusText("⚠️ Microphone permission denied. Please allow microphone access in your browser.");
      return;
    }

    if (userStream && typeof MediaRecorder !== "undefined") {
      try {
        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : MediaRecorder.isTypeSupported("audio/mp4")
              ? "audio/mp4"
              : "";

        const recorder = mimeType ? new MediaRecorder(userStream, { mimeType }) : new MediaRecorder(userStream);
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.start(250);
        mediaRecorderRef.current = recorder;
        setStatusText("🎙️ Recording... Speak now (auto-stops on silence)");
      } catch (recErr) {
        console.warn("MediaRecorder error:", recErr);
      }
    }

    // Auto-stop if user never speaks within 6 seconds
    silenceTimerRef.current = setTimeout(() => {
      if (isListeningRef.current && !input.trim()) {
        stopListening();
      }
    }, 6000);

    // 2. Also try Web Speech API for real-time live preview
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = navigator.language || "en-IN";

        recognition.onstart = () => {
          setIsListening(true);
          setStatusText("🎙️ Microphone active. Speak now...");
        };

        recognition.onresult = (event) => {
          if (!isListeningRef.current) return;
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + " ";
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            fullTranscriptRef.current += finalTranscript;
          }

          const liveText = (fullTranscriptRef.current + interimTranscript).trim();
          if (liveText) {
            setInput(liveText);
          }

          // Auto-stop after 2.5s of silence after speaking
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (isListeningRef.current) {
              stopListening();
            }
          }, 2500);
        };

        recognition.onerror = (event) => {
          console.warn("Speech API note:", event.error);
        };

        recognition.onend = () => {
          // Handled by stopListening
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.warn("Speech recognition notice:", err);
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (isListening) {
      stopListening();
    }

    const newMessages = [...messages, { from: "user", text: trimmed }];
    const reply = chatbotLogic(trimmed);
    setMessages([...newMessages, { from: "bot", text: reply }]);
    setInput("");
    fullTranscriptRef.current = "";
    setStatusText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white shadow-2xl rounded-2xl border border-gray-200 flex flex-col z-50 overflow-hidden font-sans">
      {/* Header */}
      <div className="p-3 font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg">👮‍♂️</span>
          <span className="text-sm font-semibold">OP Bot (Voice & Text)</span>
        </div>
        <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" title="Online" />
      </div>

      {/* Messages */}
      <div className="p-3 h-72 overflow-y-auto bg-gray-50/50 space-y-2 text-sm">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex flex-col ${m.from === "bot" ? "items-start" : "items-end"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 shadow-xs leading-relaxed ${
                m.from === "bot"
                  ? "bg-white border border-gray-200 text-gray-800 rounded-tl-xs"
                  : "bg-blue-600 text-white rounded-tr-xs"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Live Voice Status Bar */}
      {(isListening || isTranscribing || statusText) && (
        <div className={`px-3 py-1.5 text-xs font-medium border-t flex items-center justify-between ${
          isTranscribing
            ? "bg-indigo-50 text-indigo-700 border-indigo-100"
            : isListening
              ? "bg-red-50 text-red-600 border-red-100"
              : "bg-amber-50 text-amber-700 border-amber-100"
        }`}>
          <span className="truncate">{statusText || (isListening ? "🎙️ Listening... Speak now" : "")}</span>
          {isListening && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
          )}
        </div>
      )}

      {/* Input Controls */}
      <div className="p-2.5 bg-white border-t border-gray-200 flex items-center gap-1.5">
        <input
          ref={inputFieldRef}
          className="border border-gray-300 px-3 py-1.5 flex-grow rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            fullTranscriptRef.current = e.target.value;
          }}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Recording voice... (auto-stops on pause)" : "Type or speak message..."}
        />

        {/* Mic Toggle Button */}
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center ${
            isListening
              ? "bg-red-500 text-white animate-pulse shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-blue-600"
          }`}
          title={isListening ? "Stop listening" : "Start speaking"}
          aria-label={isListening ? "Stop listening" : "Start speaking"}
        >
          {isListening ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>

        {/* Send Button */}
        <button
          type="button"
          onClick={sendMessage}
          disabled={!input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors shadow-xs active:scale-95"
        >
          Send
        </button>
      </div>
    </div>
  );
}
