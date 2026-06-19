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
  Clock,
  Table // <-- Required for the Standings tab icon
} from "lucide-react";

// Data and Layout Configurations
//import { matches, teams, groups } from "./data/matches";
import { sameLocalDay, formatKickoff, formatDateOnly } from "./utils/dateUtils";
import "./styles.css";

// Modular Components & Hooks
import MatchCard from "./components/MatchCard";
import MatchDetails from "./components/MatchDetails";
import { useStandings } from "./hooks/useStandings"; // <-- Your custom hook!
// Change your import to look like this:
import { matches, teams, groups, fifaRankings } from "./data/matches";

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

  new Notification(`GOAL! ${match.homeCode} ${homeScore} - ${awayScore} ${match.awayCode}`, {
    body: `Live simulator alert for ${match.group} at ${match.venue}.`,
    icon: `https://flagcdn.com/w80/${match.homeISO?.toLowerCase()}.png`
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

  // Fetch the standings data from your custom hook
  const groupStandings = useStandings(matches, groups);

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
        
        {/* HERE IS THE STANDINGS TAB */}
        <button className={tab === "standings" ? "selected" : ""} onClick={() => setTab("standings")}>
          <Table size={16} /> Standings
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

      {/* Dynamic Search Preview - Expanded Team Profile */}
      {matchedTeam && (() => {
        // Find the team's live tournament stats straight from our custom hook!
        const stats = groupStandings.flatMap(g => g.teams).find(t => t.code === matchedTeam.code);
        const ranking = fifaRankings[matchedTeam.code] || "N/A";

        return (
          <section className="card" style={{ marginBottom: "18px", border: "1px solid rgba(147, 197, 253, 0.3)", background: "linear-gradient(135deg, #172554, #0f172a)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
              
              {/* Left Side: Team Identity */}
              <div>
                <p className="eyebrow" style={{ marginBottom: "8px" }}>Team Profile</p>
                <h2 style={{ display: "flex", alignItems: "center", gap: "14px", margin: "0 0 8px 0" }}>
                  <img 
                    src={`https://flagcdn.com/w80/${matchedTeam.iso?.toLowerCase()}.png`} 
                    alt="" 
                    style={{ width: "54px", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }} 
                  />
                  {matchedTeam.name} <span style={{ color: "#94a3b8", fontSize: "1.2rem" }}>({matchedTeam.code})</span>
                </h2>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span className="groupTag" style={{ fontSize: "0.85rem" }}>{matchedTeam.group}</span>
                  <span style={{ color: "#cbd5e1", fontSize: "0.9rem", fontWeight: "600" }}>FIFA Rank: #{ranking}</span>
                </div>
              </div>

              {/* Right Side: Tournament Stats Dashboard */}
              {stats && (
                <div style={{ display: "flex", gap: "24px", alignItems: "center", background: "rgba(0,0,0,0.25)", padding: "16px 28px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ textAlign: "center" }}>
                    <p className="muted" style={{ margin: "0 0 6px 0", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>Points</p>
                    <p style={{ margin: 0, fontSize: "1.8rem", fontWeight: "900", color: "#bbf7d0", lineHeight: "1" }}>{stats.points}</p>
                  </div>
                  
                  <div style={{ width: "1px", height: "40px", background: "rgba(255,255,255,0.1)" }}></div>
                  
                  <div style={{ textAlign: "center" }}>
                    <p className="muted" style={{ margin: "0 0 6px 0", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>Record (W-D-L)</p>
                    <p style={{ margin: 0, fontSize: "1.3rem", fontWeight: "800", color: "#e5e7eb", lineHeight: "1" }}>
                      {stats.win} - {stats.draw} - {stats.loss}
                    </p>
                  </div>
                  
                  <div style={{ width: "1px", height: "40px", background: "rgba(255,255,255,0.1)" }}></div>
                  
                  <div style={{ textAlign: "center" }}>
                    <p className="muted" style={{ margin: "0 0 6px 0", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>Goal Diff</p>
                    <p style={{ margin: 0, fontSize: "1.3rem", fontWeight: "800", color: "#e5e7eb", lineHeight: "1" }}>
                      {stats.gd > 0 ? `+${stats.gd}` : stats.gd}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button 
                onClick={() => toggleFollow(matchedTeam.code)} 
                style={{ 
                  background: followedTeams.includes(matchedTeam.code) ? "#e5e7eb" : "#2563eb", 
                  color: followedTeams.includes(matchedTeam.code) ? "#0f172a" : "#fff" 
                }}
                className="notifyBtn"
              >
                <Star size={16} fill={followedTeams.includes(matchedTeam.code) ? "#0f172a" : "none"} />
                {followedTeams.includes(matchedTeam.code) ? "Following Team" : "Follow Team"}
              </button>
            </div>
          </section>
        );
      })()}

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
          <MatchDetails activeMatch={activeMatch} followedTeams={followedTeams} toggleFollow={toggleFollow} now={now} onSimulateGoal={sendGoalDemo} />
        </section>
      )}

      {/* View Case 2: Tournament Groups Layout */}
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
                    <img src={`https://flagcdn.com/w20/${team.iso?.toLowerCase()}.png`} alt="" style={{ width: "20px", borderRadius: "2px" }} />
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
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <img src={`https://flagcdn.com/w20/${match.homeISO?.toLowerCase()}.png`} alt="" style={{ width: "16px", borderRadius: "2px" }} />
                      {match.homeCode}
                    </span>
                    <strong>vs</strong>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <img src={`https://flagcdn.com/w20/${match.awayISO?.toLowerCase()}.png`} alt="" style={{ width: "16px", borderRadius: "2px" }} />
                      {match.awayCode}
                    </span>
                    <small>{formatDateOnly(match.kickoffUTC)}</small>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ============================================================================ */}
      {/* NEW VIEW CASE: STANDINGS TABLE USING THE HOOK */}
      {/* ============================================================================ */}
      {tab === "standings" && (
        <section className="groupsGrid">
          {groupStandings.map(group => (
            <div className="card groupCard" key={group.name} style={{ overflow: "hidden" }}>
              <div className="sectionTitle">
                <Table size={20} />
                <h2>{group.name} Table</h2>
              </div>
              
              <div style={{ overflowX: "auto", margin: "0 -18px", padding: "0 18px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", fontSize: "0.9rem", minWidth: "300px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
                      <th style={{ textAlign: "left", padding: "12px 8px" }}>Team</th>
                      <th style={{ padding: "12px 4px" }} title="Matches Played">MP</th>
                      <th style={{ padding: "12px 4px" }} title="Wins">W</th>
                      <th style={{ padding: "12px 4px" }} title="Draws">D</th>
                      <th style={{ padding: "12px 4px" }} title="Losses">L</th>
                      <th style={{ padding: "12px 4px" }} title="Goals For">GF</th>
                      <th style={{ padding: "12px 4px" }} title="Goals Against">GA</th>
                      <th style={{ padding: "12px 4px" }} title="Goal Difference">GD</th>
                      <th style={{ padding: "12px 4px" }} title="Points">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.teams.map((team, idx) => (
                      <tr key={team.code} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ textAlign: "left", padding: "12px 8px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ color: idx < 2 ? "#bbf7d0" : "#94a3b8", width: "12px", fontWeight: "800" }}>{idx + 1}</span>
                          <img src={`https://flagcdn.com/w20/${team.iso?.toLowerCase()}.png`} alt="" style={{ width: "18px", borderRadius: "2px" }} />
                          <span style={{ fontWeight: "600", color: "#e5e7eb" }}>{team.code}</span>
                        </td>
                        <td>{team.played}</td>
                        <td>{team.win}</td>
                        <td>{team.draw}</td>
                        <td>{team.loss}</td>
                        <td style={{ color: "#94a3b8" }}>{team.gf}</td>
                        <td style={{ color: "#94a3b8" }}>{team.ga}</td>
                        <td>{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                        <td style={{ fontWeight: "900", color: "#93c5fd", fontSize: "1.05rem" }}>{team.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
          <MatchDetails activeMatch={activeMatch} followedTeams={followedTeams} toggleFollow={toggleFollow} now={now} onSimulateGoal={sendGoalDemo} />
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
                {followedTeams.map((code) => {
                  const teamObj = teams.find(t => t.code === code);
                  return (
                    <span key={code} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      {teamObj?.iso && (
                        <img src={`https://flagcdn.com/w20/${teamObj.iso.toLowerCase()}.png`} alt="" style={{ width: "16px", borderRadius: "2px" }} />
                      )}
                      {code}
                    </span>
                  );
                })}
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
          <MatchDetails activeMatch={activeMatch} followedTeams={followedTeams} toggleFollow={toggleFollow} now={now} onSimulateGoal={sendGoalDemo} />
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
              <p className="discussionTitle" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                Discussion: 
                <img src={`https://flagcdn.com/w20/${activeMatch.homeISO?.toLowerCase()}.png`} alt="" style={{ width: "16px", borderRadius: "2px" }} /> {activeMatch.home} 
                vs 
                <img src={`https://flagcdn.com/w20/${activeMatch.awayISO?.toLowerCase()}.png`} alt="" style={{ width: "16px", borderRadius: "2px" }} /> {activeMatch.away}
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