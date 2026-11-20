import type { Category, Player, Question, Tournament } from "./types";

export const CATEGORIES: Category[] = ["Premier League", "Champions League", "World Cup", "AFCON", "Legends", "Clubs", "International"];

const Q = (id: string, category: Category, q: string, options: string[], answer: number): Question => ({ id, category, q, options, answer });

export const QUESTIONS: Question[] = [
  Q("q1", "Premier League", "Which club won the first Premier League title in 1992/93?", ["Arsenal", "Manchester United", "Blackburn Rovers", "Leeds United"], 1),
  Q("q2", "Premier League", "Who holds the record for most Premier League goals?", ["Wayne Rooney", "Harry Kane", "Alan Shearer", "Sergio Agüero"], 2),
  Q("q3", "Premier League", "Which team went unbeaten through the 2003/04 season?", ["Chelsea", "Arsenal", "Man United", "Liverpool"], 1),
  Q("q4", "Premier League", "Leicester City won the league in which season?", ["2014/15", "2015/16", "2016/17", "2013/14"], 1),
  Q("q5", "Premier League", "How many points did Man City set as the record in 2017/18?", ["98", "99", "100", "102"], 2),
  Q("q6", "Champions League", "Which club has won the most Champions League / European Cup titles?", ["AC Milan", "Bayern Munich", "Liverpool", "Real Madrid"], 3),
  Q("q7", "Champions League", "Who is the all-time top scorer in the Champions League?", ["Lionel Messi", "Cristiano Ronaldo", "Robert Lewandowski", "Raúl"], 1),
  Q("q8", "Champions League", "Liverpool's 2005 'Miracle of Istanbul' final was against?", ["Juventus", "AC Milan", "Barcelona", "Inter Milan"], 1),
  Q("q9", "Champions League", "Which English club won the 2021 Champions League final?", ["Man City", "Liverpool", "Chelsea", "Tottenham"], 2),
  Q("q10", "World Cup", "Which country has won the most FIFA World Cups?", ["Germany", "Italy", "Argentina", "Brazil"], 3),
  Q("q11", "World Cup", "Who won the 2022 World Cup Golden Ball?", ["Kylian Mbappé", "Lionel Messi", "Luka Modrić", "Julián Álvarez"], 1),
  Q("q12", "World Cup", "Where was the 2010 FIFA World Cup held?", ["Brazil", "Germany", "South Africa", "Japan"], 2),
  Q("q13", "World Cup", "Who is the all-time top scorer at World Cup finals?", ["Ronaldo Nazário", "Miroslav Klose", "Just Fontaine", "Pelé"], 1),
  Q("q14", "AFCON", "Which nation has won the most AFCON titles?", ["Cameroon", "Ghana", "Egypt", "Nigeria"], 2),
  Q("q15", "AFCON", "Nigeria's Super Eagles won AFCON in 1980, 1994 and which other year?", ["2000", "2013", "2004", "2019"], 1),
  Q("q16", "AFCON", "Who won AFCON 2023 (played in 2024)?", ["Nigeria", "Ivory Coast", "South Africa", "Senegal"], 1),
  Q("q17", "AFCON", "Who is AFCON's all-time top scorer?", ["Samuel Eto'o", "Didier Drogba", "Rashidi Yekini", "Laurent Pokou"], 0),
  Q("q18", "Legends", "Jay-Jay Okocha played for which English club?", ["Bolton Wanderers", "Everton", "Fulham", "Aston Villa"], 0),
  Q("q19", "Legends", "Which legend is nicknamed 'O Fenômeno'?", ["Ronaldinho", "Ronaldo Nazário", "Romário", "Kaká"], 1),
  Q("q20", "Legends", "George Weah won the Ballon d'Or in which year?", ["1993", "1995", "1997", "1999"], 1),
  Q("q21", "Legends", "Zinedine Zidane headbutted which player in the 2006 final?", ["Gattuso", "Cannavaro", "Materazzi", "Pirlo"], 2),
  Q("q22", "Clubs", "Which club plays home games at Anfield?", ["Everton", "Liverpool", "Man City", "Leeds"], 1),
  Q("q23", "Clubs", "Which club is nicknamed 'The Old Lady'?", ["AC Milan", "Juventus", "Roma", "Napoli"], 1),
  Q("q24", "Clubs", "Signal Iduna Park is home to?", ["Bayern Munich", "Schalke", "Borussia Dortmund", "Leipzig"], 2),
  Q("q25", "Clubs", "Enyimba FC is based in which Nigerian city?", ["Lagos", "Kano", "Aba", "Enugu"], 2),
  Q("q26", "International", "Who won Euro 2020 (played in 2021)?", ["England", "Italy", "Spain", "France"], 1),
  Q("q27", "International", "Who has the most international goals in men's football?", ["Ali Daei", "Lionel Messi", "Cristiano Ronaldo", "Sunil Chhetri"], 2),
  Q("q28", "International", "Which country won Olympic football gold at Atlanta 1996?", ["Brazil", "Argentina", "Nigeria", "Cameroon"], 2),
  Q("q29", "International", "Copa América 2024 was won by?", ["Brazil", "Uruguay", "Colombia", "Argentina"], 3),
  Q("q30", "World Cup", "Which African nation reached the 2022 World Cup semi-finals?", ["Senegal", "Morocco", "Ghana", "Cameroon"], 1),
];

const av = (seed: string) => `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=3478f6,b9f34a,1e2a4a`;

export const PLAYERS: Player[] = [
  { id: "p1", name: "TekeKing", country: "🇳🇬", points: 18420, wins: 212, accuracy: 91, level: 42, online: true },
  { id: "p2", name: "AmaraGoals", country: "🇬🇭", points: 17110, wins: 198, accuracy: 89, level: 40, online: true },
  { id: "p3", name: "LagosMaestro", country: "🇳🇬", points: 16540, wins: 185, accuracy: 88, level: 39 },
  { id: "p4", name: "Kop_Tunde", country: "🇳🇬", points: 15200, wins: 170, accuracy: 86, level: 37, online: true },
  { id: "p5", name: "SamuraiBlue", country: "🇰🇪", points: 14890, wins: 161, accuracy: 85, level: 36 },
  { id: "p6", name: "Ifeoma_FC", country: "🇳🇬", points: 13970, wins: 150, accuracy: 84, level: 34, online: true },
  { id: "p7", name: "PharaohFan", country: "🇪🇬", points: 13020, wins: 141, accuracy: 83, level: 33 },
  { id: "p8", name: "Drogba11", country: "🇨🇮", points: 12450, wins: 133, accuracy: 82, level: 31, online: true },
  { id: "p9", name: "KanoTiki", country: "🇳🇬", points: 11800, wins: 122, accuracy: 80, level: 30 },
  { id: "p10", name: "BafanaBoss", country: "🇿🇦", points: 11240, wins: 118, accuracy: 79, level: 29 },
  { id: "p11", name: "AtlasLion", country: "🇲🇦", points: 10660, wins: 110, accuracy: 78, level: 28, online: true },
  { id: "p12", name: "GoonerChidi", country: "🇳🇬", points: 9980, wins: 102, accuracy: 77, level: 27 },
].map((p) => ({ ...p, avatar: av(p.name) }));

export const ME_AVATAR = av("FanzoneMe");

const H = 3600_000;
export const makeTournaments = (now: number): Tournament[] => [
  { id: "t1", name: "Premier League Showdown", category: "Premier League", entry: "Free entry", prize: "25,000 FZ Points", participants: 1284, max: 2000, endsAt: now + 5 * H, rules: ["10 questions, 2 minutes", "Highest score wins; ties broken by speed", "One entry per player"] },
  { id: "t2", name: "AFCON Legends Cup", category: "AFCON", entry: "Free entry", prize: "15,000 FZ Points", participants: 842, max: 1000, endsAt: now + 9 * H, rules: ["African football only", "Top 50 share the prize pool", "One entry per player"] },
  { id: "t3", name: "UCL Night Masters", category: "Champions League", entry: "Level 10+", prize: "40,000 FZ Points", participants: 2310, max: 5000, endsAt: now + 14 * H, rules: ["Champions League history", "Top 100 rewarded", "Must be Level 10 or above"] },
  { id: "t4", name: "World Cup Marathon", category: "World Cup", entry: "Free entry", prize: "Exclusive Badge + 10,000 FZ", participants: 503, max: 1500, endsAt: now + 22 * H, rules: ["World Cup trivia from 1930–2022", "Top 10 earn a profile badge"] },
];

export const RECENT_WINNERS = [
  { player: PLAYERS[1]!, event: "Morning Blitz", prize: "5,000 FZ" },
  { player: PLAYERS[3]!, event: "UCL Night Masters", prize: "12,000 FZ" },
  { player: PLAYERS[7]!, event: "Head-to-Head Streak ×10", prize: "2,500 FZ" },
  { player: PLAYERS[0]!, event: "Weekly Champions", prize: "30,000 FZ" },
];

export const BADGES = [
  { id: "b1", name: "First Whistle", desc: "Play your first quiz", icon: "🎯" },
  { id: "b2", name: "Hat-Trick", desc: "Win 3 games in a row", icon: "⚽" },
  { id: "b3", name: "Perfect 10", desc: "Score 10/10", icon: "💯" },
  { id: "b4", name: "Derby Day", desc: "Win a Head-to-Head", icon: "⚔️" },
  { id: "b5", name: "Cup Runner", desc: "Join a tournament", icon: "🏆" },
  { id: "b6", name: "Legend", desc: "Reach 10,000 points", icon: "👑" },
];

export function pickQuestions(pool: Question[], n = 10, category?: Category, seed?: number) {
  const list = category ? pool.filter((q) => q.category === category) : pool;
  const src = list.length >= n ? list : [...list, ...pool.filter((q) => !list.includes(q))];
  let s = seed ?? Math.floor(Math.random() * 1e9);
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return [...src].sort(() => rand() - 0.5).slice(0, n);
}
