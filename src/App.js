import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Home as HomeIcon, Search as SearchIcon } from "lucide-react";

// Sample schedule data — just two weeks for now.
// You could expand this later if you want more weeks.
const schedule = {
  1: [
    { home: "Chiefs", away: "Lions" },
    { home: "Cowboys", away: "Giants" },
  ],
  2: [
    { home: "Chiefs", away: "Bengals" },
    { home: "Cowboys", away: "Jets" },
  ],
};

// Header component: shows the Home button and search bar at the top.
// I tried to keep this simple, so it just uses react-router's useNavigate.
function Header() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  // When you press Enter in the search input, it goes to /team/TeamName
  const handleSearch = (e) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/team/${query.trim()}`);
      setQuery("");
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 shadow-md">
      {/* Home button: clicking this will navigate to the homepage */}
      <button className="flex items-center gap-1" onClick={() => navigate("/")}>
        <HomeIcon className="w-6 h-6" />
        <span className="font-semibold">Home</span>
      </button>

      {/* Search input: you type a team name and hit Enter */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          className="pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring"
          placeholder="Search team…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>
    </header>
  );
}

// HeadToHead component: shows two big buttons for the home and away team.
// Clicking a button increments that team's count and shows percentage.
function HeadToHead({ matchup }) {
  const [counts, setCounts] = useState({ home: 0, away: 0 });
  const total = counts.home + counts.away;
  const pctHome = total ? Math.round((counts.home / total) * 100) : 0;
  const pctAway = total ? 100 - pctHome : 0;

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6">
      <h2 className="text-2xl font-bold">Pick the winner</h2>
      <div className="grid grid-cols-2 gap-8">
        {["home", "away"].map((side) => (
          <button
            key={side}
            onClick={() => setCounts((c) => ({ ...c, [side]: c[side] + 1 }))}
            className="flex flex-col items-center justify-center w-64 h-64 bg-white rounded-2xl shadow-lg hover:shadow-xl transition"
          >
            {/* Show the team name */}
            <span className="text-xl font-semibold">{matchup[side]}</span>
            {/* Show percentage or “--” if no votes yet */}
            <div className="text-lg text-gray-500 mt-2">
              {total === 0
                ? "--"
                : side === "home"
                ? `${pctHome}%`
                : `${pctAway}%`}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// WeekSelector component: slider to pick the week number.
// It shows “Week X” and a range input from 1 to maxWeek.
function WeekSelector({ week, setWeek, maxWeek }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-4">
      <label htmlFor="week" className="font-medium">
        Week {week}
      </label>
      <input
        id="week"
        type="range"
        min="1"
        max={maxWeek}
        value={week}
        onChange={(e) => setWeek(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

// MatchupList component: lists all matchups for the selected week.
// Clicking one sets that matchup as the current “HeadToHead” selection.
function MatchupList({ matchups, onSelect }) {
  return (
    <div className="px-6 pb-6 grid gap-3">
      {matchups.map((m, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(m)}
          className="flex justify-between px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200"
        >
          <span>{m.away}</span>
          <span className="font-semibold">@</span>
          <span>{m.home}</span>
        </button>
      ))}
    </div>
  );
}

// HomePage component: ties everything together.
// - Holds the “week” state (default 1).
// - Holds the “selected matchup” state (default first matchup of week 1).
function HomePage() {
  const [week, setWeek] = useState(1);
  const [selected, setSelected] = useState(schedule[1][0]);
  const matchups = schedule[week];

  return (
    <div className="flex-1 flex flex-col">
      {/* Head-to-head area will grow to fill available space */}
      <HeadToHead matchup={selected} />

      {/* Slider + matchup list at the bottom */}
      <div>
        <WeekSelector
          week={week}
          setWeek={setWeek}
          maxWeek={Object.keys(schedule).length}
        />
        <MatchupList matchups={matchups} onSelect={setSelected} />
      </div>
    </div>
  );
}

// TeamPage component: shows a team's matchups across all weeks.
// It reads the “team” param from the URL.
function TeamPage() {
  const { team } = useParams();
  const matchups = [];

  // Gather all matchups where home or away matches the team name (case-insensitive).
  Object.entries(schedule).forEach(([wk, list]) =>
    list.forEach((m) => {
      if (
        m.home.toLowerCase() === team.toLowerCase() ||
        m.away.toLowerCase() === team.toLowerCase()
      ) {
        matchups.push({ week: wk, ...m });
      }
    })
  );

  return (
    <div className="p-6 flex flex-col gap-4">
      <h2 className="text-3xl font-bold capitalize">{team} matchups</h2>
      {matchups.length === 0 ? (
        <p>No matchups found.</p>
      ) : (
        matchups.map((m, i) => (
          <div
            key={i}
            className="flex justify-between bg-gray-100 rounded-xl p-4"
          >
            <span className="font-medium">Week {m.week}</span>
            <span>
              {m.away} @ {m.home}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

// Main App component: sets up React Router and makes the app fill the screen.
export default function App() {
  return (
    <Router>
      {/* Use w-full h-screen so everything fills the viewport */}
      <div className="w-full h-screen flex flex-col">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/team/:team" element={<TeamPage />} />
        </Routes>
      </div>
    </Router>
  );
}
