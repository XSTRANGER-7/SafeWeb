// components/ChatBot.jsx
import { useState } from "react";
import { chatbotLogic } from "../utils/ChatbotLogic";

export default function ChatBot() {
  const [messages, setMessages] = useState([{ from: "bot", text: "Hi! I’m OP Bot 👮‍♂️. How can I help you today?" }]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    const newMessages = [...messages, { from: "user", text: input }];
    const reply = chatbotLogic(input);
    setMessages([...newMessages, { from: "bot", text: reply }]);
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 w-72 bg-white shadow-lg rounded-2xl border">
      <div className="p-2 font-bold bg-blue-100 text-center">OP Bot 💬</div>
      <div className="p-2 h-64 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`my-1 text-sm ${m.from === "bot" ? "text-blue-600" : "text-gray-700 text-right"}`}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="p-2 flex gap-1">
        <input
          className="border p-1 flex-grow rounded-lg text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type here..."
        />
        <button onClick={sendMessage} className="bg-blue-600 text-white px-2 rounded-lg text-sm">
          Send
        </button>
      </div>
    </div>
  );
}
