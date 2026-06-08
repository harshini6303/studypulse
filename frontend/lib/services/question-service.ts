import questionsData from "../../data/questions.json";

export const getQuestions = (subject: string) => {
  subject = subject.toUpperCase();

  const all = questionsData.filter((q: any) => q.subject === subject);

  const conceptMap: Record<string, any[]> = {};

  all.forEach((q: any) => {
    if (!conceptMap[q.concept]) conceptMap[q.concept] = [];
    conceptMap[q.concept].push(q);
  });

  const finalQuestions: any[] = [];

  Object.values(conceptMap).forEach((qs: any[]) => {
    const easy = qs.filter((q: any) => q.difficulty === "easy");
    const medium = qs.filter((q: any) => q.difficulty === "medium");
    const hard = qs.filter((q: any) => q.difficulty === "hard");

    if (easy.length >= 2 && medium.length >= 2 && hard.length >= 2) {
      finalQuestions.push(...randomPick(easy, 2));
      finalQuestions.push(...randomPick(medium, 2));
      finalQuestions.push(...randomPick(hard, 2));
    }
  });

  return shuffle(finalQuestions);
};

function randomPick(arr: any[], count: number) {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
}

function shuffle(arr: any[]) {
  return [...arr].sort(() => 0.5 - Math.random());
}