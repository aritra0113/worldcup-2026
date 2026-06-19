import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Search,
  Star,
  MessageCircle,
  CalendarDays,
  Trophy,
  Users,
  Home,
  ListFilter,
  Clock
} from "lucide-react";

// Data and Layout Configurations
import { matches, teams, groups, flags } from "./data/matches";
import { sameLocalDay, formatKickoff, formatDateOnly } from "./utils/dateUtils";
import "./styles.css";

// Modular Components
import MatchCard from "./components/MatchCard";
import MatchDetails from "./components/MatchDetails";

const STORAGE_KEY = "worldcuppulse_state_v2";

// Local Storage Persistent State Readers
function readState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { followedTeams: [], comments: {} };
  } catch {
    return { followedTeams: [], comments: {} };
  }
}

function writeState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Browser Level Notification Permission Handlers
function canNotify() {
  return "Notification" in window;
}

async function requestNotifications() {
  if (!canNotify()) {
    alert("Your browser does not support notifications.");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    new Notification("WorldCupPulse notifications enabled", {
      body: "Goal alert demo is ready."
    });
  }
}

function sendGoalDemo(match) {
  if (!canNotify()) {
    alert("Notifications are not supported in this browser.");
    return;
  }

  if (Notification.permission !== "granted") {
    alert("Click Enable notifications first.");
    return;
  }

  const homeScore = match.homeScore !== null ? match.homeScore : 0;
  const awayScore = match.awayScore !== null ? match.awayScore : 0;

  new Notification(`GOAL! ${flags[match.homeCode] || "⚽"} ${match.homeCode} ${homeScore} - ${awayScore} ${match.awayCode}`, {
    body: `Live simulator alert for ${match.group} at ${match.venue}.`
  });
}

function App() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("today");
  const [activeMatchId, setActiveMatchId] = useState(matches[0]?.id);
  const [state, setState] = useState(readState());
  const [commentText, setCommentText] = useState("");
  const [now, setNow] = useState(new Date());

  // Global Sync Timer Clock loop for matching countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const followedTeams = state.followedTeams || [];
  const activeMatch = matches.find((m) => m.id === activeMatchId) || matches[0];

  // Filters matches matching input query strings
  const filteredMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return matches;

    return matches.filter((m) =>
      [m.home, m.away, m.homeCode, m.awayCode, m.group, m.status, m.venue]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [query]);

  // Scans countries matching input query strings
  const matchedTeam = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    return teams.find(
      (t) => t.name.toLowerCase().includes(q) || t.code.toLowerCase() === q
    );
  }, [query]);

  const todayMatches = useMemo(() => {
    const today = new Date();
    return matches.filter((m) => sameLocalDay(new Date(m.kickoffUTC), today));
  }, []);

  const nextMatches = useMemo(() => {
    const currentNow = new Date();
    return matches
      .filter((m) => new Date(m.kickoffUTC) >= currentNow)
      .sort((a, b) => new Date(a.kickoffUTC) - new Date(b.kickoffUTC))
      .slice(0, 6);
  }, []);

  const myTeamMatches = useMemo(() => {
    if (followedTeams.length === 0) return [];
    return matches.filter((m) =>
      followedTeams.includes(m.homeCode) || followedTeams.includes(m.awayCode)
    );
  }, [followedTeams]);

  function updateState(next) {
    setState(next);
    writeState(next);
  }

  function toggleFollow(code) {
    const exists = followedTeams.includes(code);
    const next = exists
      ? followedTeams.filter((x) => x !== code)
      : [...followedTeams, code];

    updateState({ ...state, followedTeams: next });
  }

  function addComment() {
    const text = commentText.trim();
    if (!text || !activeMatch) return;

    const current = state.comments?.[activeMatch.id] || [];
    const comment = {
      id: crypto.randomUUID(),
      text,
      createdAt: new Date().toISOString()
    };

    updateState({
      ...state,
      comments: { ...(state.comments || {}), [activeMatch.id]: [comment, ...current] }
    });

    setCommentText("");
  }

  const comments = state.comments?.[activeMatch?.id] || [];
  const todayOrNext = todayMatches.length > 0 ? todayMatches : nextMatches;

  return (
    <main className="app">
      {/* Top Welcome Title Banner */}
      <section className="hero">
        <div>
          <p className="eyebrow">World Cup 2026 MVP</p>
          <h1>WorldCupPulse</h1>
          <p className="subtitle">
            Today’s matches, groups, fixtures, country search, team follows and goal notification demo.
          </p>
        </div>

        <button className="notifyBtn" onClick={requestNotifications}>
          <Bell size={18} />
          Enable notifications
        </button>
      </section>

      {/* Main Tab Routing Options */}
      <nav className="tabs">
        <button className={tab === "today" ? "selected" : ""} onClick={() => setTab("today")}>
          <Home size={16} /> Today
        </button>
        <button className={tab === "groups" ? "selected" : ""} onClick={() => setTab("groups")}>
          <Users size={16} /> Groups
        </button>
        <button className={tab === "fixtures" ? "selected" : ""} onClick={() => setTab("fixtures")}>
          <ListFilter size={16} /> Fixtures
        </button>
        <button className={tab === "myteams" ? "selected" : ""} onClick={() => setTab("myteams")}>
          <Star size={16} /> My Teams
        </button>
        <button className={tab === "discussion" ? "selected" : ""} onClick={() => setTab("discussion")}>
          <MessageCircle size={16} /> Discussion
        </button>
      </nav>

      {/* Search Bar Block */}
      <section className="searchCard">
        <Search size={20} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search country, code, or group... e.g. Brazil, ARG, Group A"
        />
      </section>

      {/* Dynamic Search Preview Matching Row */}
      {matchedTeam && (
        <section className="teamPanel">
          <div>
            <p className="eyebrow">Country found</p>
            <h2>{matchedTeam.flag} {matchedTeam.name} ({matchedTeam.code})</h2>
            <p>{matchedTeam.group}</p>
          </div>

          <button onClick={() => toggleFollow(matchedTeam.code)}>
            <Star size={16} />
            {followedTeams.includes(matchedTeam.code) ? "Following" : "Follow team"}
          </button>
        </section>
      )}

      {/* View Case 1: Today/Next Matches */}
      {tab === "today" && (
        <section className="grid">
          <div className="card">
            <div className="sectionTitle">
              <Clock size={20} />
              <h2>{todayMatches.length > 0 ? "Today’s matches" : "Next matches"}</h2>
            </div>

            <div className="matchList">
              {todayOrNext.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  active={match.id === activeMatch?.id}
                  now={now}
                  onClick={() => setActiveMatchId(match.id)}
                />
              ))}
            </div>
          </div>

          <MatchDetails
            activeMatch={activeMatch}
            followedTeams={followedTeams}
            toggleFollow={toggleFollow}
            now={now}
            onSimulateGoal={sendGoalDemo}
          />
        </section>
      )}

      {/* View Case 2: Tournament Groups Layout Matrix */}
      {tab === "groups" && (
        <section className="groupsGrid">
          {groups.map((group) => (
            <div className="card groupCard" key={group.name}>
              <div className="sectionTitle">
                <Trophy size={20} />
                <h2>{group.name}</h2>
              </div>

              <div className="teamChips">
                {group.teams.map((team) => (
                  <button key={team.code} onClick={() => toggleFollow(team.code)}>
                    <span>{team.flag}</span>
                    <span>{team.name}</span>
                    <small>{followedTeams.includes(team.code) ? "Following" : team.code}</small>
                  </button>
                ))}
              </div>

              <h3>Remaining matches</h3>
              <div className="miniFixtures">
                {group.matches.map((match) => (
                  <button
                    key={match.id}
                    onClick={() => {
                      setActiveMatchId(match.id);
                      setTab("today");
                    }}
                  >
                    <span>{flags[match.homeCode] || "⚽"} {match.homeCode}</span>
                    <strong>vs</strong>
                    <span>{flags[match.awayCode] || "⚽"} {match.awayCode}</span>
                    <small>{formatDateOnly(match.kickoffUTC)}</small>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* View Case 3: Complete Tournament Fixture List */}
      {tab === "fixtures" && (
        <section className="grid">
          <div className="card">
            <div className="sectionTitle">
              <CalendarDays size={20} />
              <h2>All remaining group fixtures</h2>
            </div>

            <div className="matchList">
              {filteredMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  active={match.id === activeMatch?.id}
                  now={now}
                  onClick={() => setActiveMatchId(match.id)}
                />
              ))}
            </div>
          </div>

          <MatchDetails
            activeMatch={activeMatch}
            followedTeams={followedTeams}
            toggleFollow={toggleFollow}
            now={now}
            onSimulateGoal={sendGoalDemo}
          />
        </section>
      )}

      {/* View Case 4: Custom Bookmarked Teams Feed */}
      {tab === "myteams" && (
        <section className="grid">
          <div className="card">
            <div className="sectionTitle">
              <Star size={20} />
              <h2>My followed teams</h2>
            </div>

            {followedTeams.length === 0 ? (
              <p className="muted">No teams followed yet. Search a country or open Groups and follow teams.</p>
            ) : (
              <div className="chips">
                {followedTeams.map((code) => <span key={code}>{flags[code] || "⚽"} {code}</span>)}
              </div>
            )}

            <h3>Fixtures for followed teams</h3>
            <div className="matchList">
              {myTeamMatches.length === 0 ? (
                <p className="muted">Follow a team to see its matches here.</p>
              ) : (
                myTeamMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    active={match.id === activeMatch?.id}
                    now={now}
                    onClick={() => setActiveMatchId(match.id)}
                  />
                ))
              )}
            </div>
          </div>

          <MatchDetails
            activeMatch={activeMatch}
            followedTeams={followedTeams}
            toggleFollow={toggleFollow}
            now={now}
            onSimulateGoal={sendGoalDemo}
          />
        </section>
      )}

      {/* View Case 5: Dynamic Match Interactive Comment Timeline */}
      {tab === "discussion" && (
        <section className="card">
          <div className="sectionTitle">
            <MessageCircle size={20} />
            <h2>Match discussion</h2>
          </div>

          {activeMatch && (
            <>
              <p className="discussionTitle">
                Discussion: {flags[activeMatch.homeCode] || "⚽"} {activeMatch.home} vs {flags[activeMatch.awayCode] || "⚽"} {activeMatch.away}
              </p>

              <div className="commentBox">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write your prediction or comment..."
                />
                <button onClick={addComment}>Post</button>
              </div>

              <div className="comments">
                {comments.length === 0 && <p className="muted">No comments yet. Start the discussion.</p>}
                {comments.map((c) => (
                  <div className="comment" key={c.id}>
                    <p>{c.text}</p>
                    <small>{formatKickoff(c.createdAt)}</small>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </main>
  );
}

export default App;