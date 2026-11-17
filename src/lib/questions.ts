export type Question = { question: string; options: string[]; answer: number; category: string };
export const questions: Question[] = [
  { question: "Which country won the 2022 FIFA World Cup?", options: ["France", "Argentina", "Brazil", "Croatia"], answer: 1, category: "World Cup" },
  { question: "Which club is known as the Red Devils?", options: ["Liverpool", "Arsenal", "Manchester United", "Chelsea"], answer: 2, category: "Clubs" },
  { question: "How many players start for one football team on the pitch?", options: ["9", "10", "11", "12"], answer: 2, category: "Rules" },
  { question: "Who has won the most Ballon d’Or awards?", options: ["Cristiano Ronaldo", "Lionel Messi", "Zinedine Zidane", "Ronaldo Nazário"], answer: 1, category: "Players" },
  { question: "Which country hosted the 2010 FIFA World Cup?", options: ["Germany", "Brazil", "South Africa", "Russia"], answer: 2, category: "World Cup" },
  { question: "What is the maximum number of substitutions in many current top-level competitions?", options: ["3", "4", "5", "6"], answer: 2, category: "Rules" },
  { question: "Which club plays its home matches at Anfield?", options: ["Everton", "Liverpool", "Manchester City", "Tottenham"], answer: 1, category: "Clubs" },
  { question: "What is awarded when a defender commits a direct-free-kick foul inside their own penalty area?", options: ["Corner", "Penalty", "Throw-in", "Goal kick"], answer: 1, category: "Rules" },
  { question: "Which nation won AFCON 2023, played in 2024?", options: ["Nigeria", "Senegal", "Ivory Coast", "Egypt"], answer: 2, category: "Africa" },
  { question: "How long is a standard football match, excluding added time?", options: ["80 minutes", "90 minutes", "100 minutes", "120 minutes"], answer: 1, category: "Rules" }
];
