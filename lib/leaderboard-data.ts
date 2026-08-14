export interface StudentRank {
  id: string;
  name: string;
  avatarUrl?: string;
  rank: number;
  xp: number;
  level: "Advanced" | "Ordinary";
  badges: string[];
}

export const MOCK_LEADERBOARD: StudentRank[] = [
  {
    id: "1",
    name: "Eleanor Rigby",
    rank: 1,
    xp: 15420,
    level: "Advanced",
    badges: ["Scholar", "Quiz Master"],
  },
  {
    id: "2",
    name: "John Doe",
    rank: 2,
    xp: 14900,
    level: "Advanced",
    badges: ["Physics Pro"],
  },
  {
    id: "3",
    name: "Jane Smith",
    rank: 3,
    xp: 14250,
    level: "Ordinary",
    badges: ["Math Whiz", "Consistent"],
  },
  {
    id: "4",
    name: "David Bowie",
    rank: 4,
    xp: 13800,
    level: "Advanced",
    badges: ["Scholar"],
  },
  {
    id: "5",
    name: "Freddie Mercury",
    rank: 5,
    xp: 13200,
    level: "Ordinary",
    badges: ["Quiz Master"],
  },
  {
    id: "6",
    name: "Njini Favour", // Target logged-in user
    rank: 6,
    xp: 12500,
    level: "Advanced",
    badges: ["Scholar"],
  },
  {
    id: "7",
    name: "Elton John",
    rank: 7,
    xp: 12100,
    level: "Ordinary",
    badges: ["Consistent"],
  },
  {
    id: "8",
    name: "George Michael",
    rank: 8,
    xp: 11800,
    level: "Advanced",
    badges: ["Physics Pro"],
  },
  {
    id: "9",
    name: "Stevie Wonder",
    rank: 9,
    xp: 11200,
    level: "Ordinary",
    badges: ["Math Whiz"],
  },
  {
    id: "10",
    name: "Aretha Franklin",
    rank: 10,
    xp: 10500,
    level: "Advanced",
    badges: ["Scholar"],
  },
  {
    id: "11",
    name: "Whitney Houston",
    rank: 11,
    xp: 10100,
    level: "Ordinary",
    badges: [],
  },
  {
    id: "12",
    name: "Michael Jackson",
    rank: 12,
    xp: 9800,
    level: "Advanced",
    badges: ["Consistent"],
  },
  {
    id: "13",
    name: "Prince Nelson",
    rank: 13,
    xp: 9500,
    level: "Ordinary",
    badges: [],
  },
  {
    id: "14",
    name: "Tina Turner",
    rank: 14,
    xp: 9200,
    level: "Advanced",
    badges: ["Quiz Master"],
  },
  {
    id: "15",
    name: "Bob Marley",
    rank: 15,
    xp: 8900,
    level: "Ordinary",
    badges: ["Physics Pro"],
  },
];
