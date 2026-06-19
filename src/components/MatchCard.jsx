import React from "react";
import { flags } from "../data/matches";
import { formatKickoff } from "../utils/dateUtils";

export default function MatchCard({ match, active, onClick }) {
  const isFinished = match.status === "FT";
  const isLive = match.status === "LIVE";
  const hasStarted = isFinished || isLive;

  // Determine badge text and class name dynamically
  let badgeText = "Scheduled";
  let badgeClass = "scheduled";

  if (isFinished) {
    badgeText = "Match ended";
    badgeClass = "ended";
  } else if (isLive) {
    badgeText = `Live • ${match.minute}'`;
    badgeClass = "live";
  }

  return (
    <div 
      className={`matchCard ${active ? "active" : ""}`} 
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      {/* Top Header Row */}
      <div className="matchCardHeader">
        <span className="datePill">
          {new Date(match.kickoffUTC).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
        <span className="groupPill">{match.group}</span>
      </div>

      {/* Main Vs Team Code Display Row */}
      <div className="matchCardTeamsDisplay">
        <div className="teamCodeBlock">
          <span className="flagIcon">{flags[match.homeCode] || "⚽"}</span>
          <span className="codeText">{match.homeCode}</span>
        </div>
        
        <span className="vsSeparator">
          {hasStarted ? `${match.homeScore} - ${match.awayScore}` : "vs"}
        </span>

        <div className="teamCodeBlock">
          <span className="codeText">{match.awayCode}</span>
          <span className="flagIcon">{flags[match.awayCode] || "⚽"}</span>
        </div>
      </div>

      {/* Sub-details (Full Names and Time) */}
      <div className="matchCardFooter">
        <p className="fullNamesText">{match.home} vs {match.away}</p>
        <p className="timeText">{formatKickoff(match.kickoffUTC)}</p>
        
        {/* Status Badge */}
        <span className={`statusBadge ${badgeClass}`}>
          {badgeText}
        </span>
      </div>
    </div>
  );
}