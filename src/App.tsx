import { useState, useEffect } from "react";

interface Question {
  id?: string;
  question: string;
  answers: string[];
}

function App() {
  const [question, setQuestion] = useState<string>("");
  const [answers, setAnswers] = useState<string[]>([""]);
  const [questionsList, setQuestionsList] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Fetch all questions (GET)
  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_BASE_URL}/show`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: Question[]) => {
        setQuestionsList(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err: Error) => {
        console.error("Error fetching questions:", err);
        setError("Failed to load questions. Make sure the server is running.");
        setLoading(false);
      });
  }, []);

  // 🔹 Handle answer change
  const handleAnswerChange = (index: number, value: string): void => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    setAnswers(updatedAnswers);
  };

  // 🔹 Add new answer field
  const addAnswerField = (): void => {
    setAnswers([...answers, ""]);
  };

  // 🔹 Remove answer field
  const removeAnswerField = (index: number): void => {
    if (answers.length > 1) {
      const updatedAnswers = answers.filter((_, i) => i !== index);
      setAnswers(updatedAnswers);
    }
  };

  // 🔹 Submit question (POST)
  const submitQuestion = async (): Promise<void> => {
    // Validation
    if (!question.trim()) {
      alert("Please enter a question");
      return;
    }

    const filteredAnswers = answers.filter((ans) => ans.trim() !== "");
    if (filteredAnswers.length === 0) {
      alert("Please enter at least one answer");
      return;
    }

    const payload = {
      question: question.trim(),
      answers: filteredAnswers,
    };

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/addQues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedQuestion: Question = await response.json();
      setQuestionsList([...questionsList, savedQuestion]);

      // Reset form
      setQuestion("");
      setAnswers([""]);
      setLoading(false);
    } catch (err) {
      console.error("Error submitting question:", err);
      setError("Failed to submit question. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <h2>Add Question</h2>

      {error && (
        <div style={{ padding: "10px", backgroundColor: "#ffebee", color: "#c62828", borderRadius: "4px", marginBottom: "10px" }}>
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Enter question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={{ 
          width: "100%", 
          marginBottom: "10px", 
          padding: "8px",
          fontSize: "14px",
          border: "1px solid #ccc",
          borderRadius: "4px"
        }}
      />

      {answers.map((ans, index) => (
        <div key={index} style={{ display: "flex", marginBottom: "5px", gap: "5px" }}>
          <input
            type="text"
            placeholder={`Answer ${index + 1}`}
            value={ans}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            style={{ 
              flex: 1,
              padding: "8px",
              fontSize: "14px",
              border: "1px solid #ccc",
              borderRadius: "4px"
            }}
          />
          {answers.length > 1 && (
            <button 
              onClick={() => removeAnswerField(index)}
              style={{
                padding: "8px 12px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              ✕
            </button>
          )}
        </div>
      ))}

      <button 
        onClick={addAnswerField}
        style={{
          padding: "8px 16px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginRight: "10px"
        }}
      >
        ➕ Add Answer
      </button>
      
      <button 
        onClick={submitQuestion}
        disabled={loading}
        style={{
          padding: "8px 16px",
          backgroundColor: loading ? "#ccc" : "#2196F3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Submitting..." : "Submit Question"}
      </button>

      <hr style={{ margin: "30px 0" }} />

      <h2>All Questions</h2>

      {loading && <p>Loading questions...</p>}

      {!loading && questionsList.length === 0 && (
        <p style={{ color: "#666" }}>No questions yet. Add your first question above!</p>
      )}

      {questionsList.map((q, index) => (
        <div key={q.id || index} style={{ 
          marginBottom: "15px", 
          padding: "15px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          border: "1px solid #ddd"
        }}>
          <strong style={{ fontSize: "16px", color: "#333" }}>{q.question}</strong>
          <ul style={{ marginTop: "10px", paddingLeft: "20px" }}>
            {Array.isArray(q.answers) &&
              q.answers.map((a: string, i: number) => (
                <li key={i} style={{ marginBottom: "5px", color: "#555" }}>
                  {a}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default App;