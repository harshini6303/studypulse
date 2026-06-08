"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation";

export default function TestSimple() {
  const [isLoading, setIsLoading] = useState(true)
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const searchParams = useSearchParams();
const subject = (searchParams.get("subject") || "DSA").toUpperCase();

useEffect(() => {
  setIsLoading(true);

  fetch(`http://127.0.0.1:5000/questions/${subject}`)
    .then(res => res.json())
    .then(data => {
      const formatted = data.map((q: any, i: number) => ({
        id: q._id,
        questionText: q.question,
        options: q.options,
        correctAnswer: q.options.indexOf(q.correctAnswer),
        difficulty: q.difficulty,
        concept: q.concept
      }));

      setQuestions(formatted);
      setCurrentQuestionIndex(0);
      setIsLoading(false);
    })
    .catch(err => {
      console.error(err);
      setIsLoading(false);
    });

}, [subject]);
  return (
    <div style={{ padding: "20px" }}>
      <h1>Simple Test Page</h1>

      {questions.length === 0 ? (
        <p>Loading...</p>
      ) : (
        questions.map((q: any, i: number) => (
          <div key={i} style={{ marginBottom: "20px" }}>
            <h3>{q.question}</h3>
            {q.options.map((opt: string, idx: number) => (
              <div key={idx}>{opt}</div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}