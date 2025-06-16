/** @format */
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FiSend } from "react-icons/fi";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! I can help you find the best credit card. What's your monthly income?",
    },
  ]);
  const [input, setInput] = useState("");
  const [sessionId] = useState(() => crypto.randomUUID());
  const [showSummary, setShowSummary] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [userData, setUserData] = useState({
    income: "",
    spending: "",
    perks: "",
    credit_score: "",
    step: 0,
  });
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCards, setSelectedCards] = useState({ first: "", second: "" });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const restartChat = () => {
    setMessages([
      {
        from: "bot",
        text: "Hi! I can help you find the best credit card. What's your monthly income?",
      },
    ]);
    setInput("");
    setUserData({
      income: "",
      spending: "",
      perks: "",
      credit_score: "",
      step: 0,
    });
    setRecommendations([]);
    setShowSummary(false);
    setCompareMode(false);
    setSelectedCards({ first: "", second: "" });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    const nextStep = userData.step + 1;

    const newUserData = { ...userData };
    if (userData.step === 0) newUserData.income = input;
    if (userData.step === 1) newUserData.spending = input;
    if (userData.step === 2) newUserData.perks = input;
    if (userData.step === 3) newUserData.credit_score = input;

    newUserData.step = nextStep;
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await axios.post("http://localhost:8000/ask", {
        message: input,
        session_id: sessionId,
      });

      const botReply = res.data.response;
      setMessages((prev) => [...prev, { from: "bot", text: botReply }]);
      setUserData(newUserData);

      if (nextStep === 4) {
        const recRes = await axios.post(
          "http://localhost:8000/recommend",
          newUserData
        );
        setRecommendations(recRes.data.recommendations || []);
        setShowSummary(true);
      }
    } catch (err) {
      console.error("Chat API error:", err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Oops! Something went wrong." },
      ]);
    }
  };

  const handleCompare = () => setCompareMode(true);

  const card1 = recommendations.find((c) => c.name === selectedCards.first);
  const card2 = recommendations.find((c) => c.name === selectedCards.second);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-100">
      <div className="flex flex-col p-6 rounded-3xl shadow-2xl w-full max-w-3xl h-[42rem] border border-gray-300 bg-white overflow-hidden">
        <h2 className="text-3xl font-semibold mb-4 text-gray-800">
          💬 Credit Card Chat Assistant
        </h2>

        {!showSummary ? (
          <>
            <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50 border rounded-xl">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.from === "bot" ? "justify-start" : "justify-end"
                  }`}>
                  <div
                    className={`p-4 text-sm leading-relaxed rounded-2xl max-w-md whitespace-pre-wrap shadow-md ${
                      msg.from === "bot"
                        ? "bg-blue-100 text-blue-900 rounded-bl-none"
                        : "bg-green-500 text-white rounded-br-none"
                    }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex mt-4 items-center bg-white border rounded-full px-3 shadow-sm w-full">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your message..."
                className="flex-grow px-4 py-2 rounded-full text-base focus:outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="p-2 rounded-full text-white bg-green-600 hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
                <FiSend className="text-2xl" />
              </button>
            </div>
          </>
        ) : compareMode ? (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-blue-700">
              📊 Compare Recommended Cards
            </h3>
            <div className="flex gap-4">
              {["first", "second"].map((key) => (
                <select
                  key={key}
                  value={selectedCards[key]}
                  onChange={(e) =>
                    setSelectedCards((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  className="border p-2 rounded w-1/2">
                  <option value="">
                    Select {key === "first" ? "First" : "Second"} Card
                  </option>
                  {recommendations.map((card) => (
                    <option key={card.name} value={card.name}>
                      {card.name}
                    </option>
                  ))}
                </select>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[card1, card2].map((card, idx) =>
                card ? (
                  <div
                    key={idx}
                    className="p-5 border rounded-2xl bg-white shadow-md">
                    <img
                      src={card.image_url}
                      alt={card.name}
                      className="w-full h-32 object-contain mb-2"
                    />
                    <h4 className="text-lg font-semibold text-green-700 mb-1">
                      {card.name}
                    </h4>
                    <p className="mb-1">
                      <strong>Issuer:</strong> {card.issuer}
                    </p>
                    <p className="mb-1">
                      <strong>Rewards:</strong> {card.rewards}
                    </p>
                    <p className="mb-1">
                      <strong>Perks:</strong>{" "}
                      {Array.isArray(card.perks)
                        ? card.perks.join(", ")
                        : card.perks}
                    </p>
                    <p className="mb-1">
                      <strong>Estimated Benefit:</strong>{" "}
                      {card.estimated_benefit}
                    </p>
                    <ul className="list-disc ml-5 text-sm text-gray-600">
                      {card.key_reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                ) : null
              )}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setCompareMode(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition">
                🔙 Back
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-grow overflow-y-auto items-center justify-center">
            {recommendations.length === 0 ? (
              <div className="text-center text-red-600 font-semibold text-lg mt-10">
                ❌ You are not eligible for any credit cards.
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-blue-700 mb-4">
                  🎯 Your Recommended Cards
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
                  {recommendations.slice(0, 3).map((card, idx) => (
                    <div
                      key={idx}
                      className="p-5 border rounded-2xl bg-white shadow-md transition hover:shadow-lg">
                      <img
                        src={card.image_url}
                        alt={card.name}
                        className="w-full h-32 object-cover mb-3 rounded"
                      />
                      <h4 className="text-lg font-semibold text-green-700 mb-1">
                        {card.name}
                      </h4>
                      <p className="text-sm text-gray-700 mb-1">
                        <strong>Issuer:</strong> {card.issuer}
                      </p>
                      <p className="text-sm text-gray-700 mb-1">
                        <strong>Rewards:</strong> {card.rewards}
                      </p>
                      <p className="text-sm text-gray-700 mb-1">
                        <strong>Perks:</strong>{" "}
                        {Array.isArray(card.perks)
                          ? card.perks.join(", ")
                          : card.perks}
                      </p>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Estimated Benefit:</strong>{" "}
                        {card.estimated_benefit}
                      </p>
                      <ul className="list-disc text-sm text-gray-600 pl-5 mt-2">
                        {card.key_reasons.map((reason, i) => (
                          <li key={i}>{reason}</li>
                        ))}
                      </ul>
                      <a
                        href={card.apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 text-sm text-white bg-green-600 px-4 py-2 rounded-full hover:bg-green-700 transition">
                        Apply Now
                      </a>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mt-6 flex gap-4 justify-center">
              <button
                onClick={restartChat}
                className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition">
                🔁 Restart
              </button>
              {recommendations.length > 0 && (
                <button
                  onClick={handleCompare}
                  className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition">
                  📊 Compare
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBot;
