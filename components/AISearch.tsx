"use client"

import { useState } from "react"

export function AISearch() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAsk = async () => {
    if (!question.trim() || loading) return
    setLoading(true)
    setAnswer("")

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      })
      const data = await res.json()
      if (data.error) {
        setAnswer(`Error: ${data.error}`)
      } else {
        setAnswer(data.answer)
      }
    } catch {
      setAnswer("Failed to connect to the AI service.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ai-search-container">
      <div className="ai-search-box">
        <input
          className="ai-search-input"
          type="text"
          placeholder="Ask about your pipeline... e.g. 'Which rep is at risk of missing quota?'"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAsk() }}
          disabled={loading}
        />
        <button
          className="ai-search-btn"
          onClick={handleAsk}
          disabled={loading || !question.trim()}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5, marginRight: 0 }} />
              Thinking...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Cortex AI
            </>
          )}
        </button>
      </div>
      {answer && (
        <div className="ai-response">
          {answer}
        </div>
      )}
    </div>
  )
}
