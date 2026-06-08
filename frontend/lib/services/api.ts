export async function fetchQuestions(subject: string) {
  const res = await fetch(`http://127.0.0.1:5000/questions/${subject}`);
  if (!res.ok) throw new Error("Failed to fetch questions");
  return res.json();
}