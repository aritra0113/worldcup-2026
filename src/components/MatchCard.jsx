import React from "react";
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
        <span className="groupTag">{match.group}</span>
      </div>

      {/* Main Vs Team Code Display Row */}
      <div className="matchCardTeamsDisplay">
        <div className="teamCodeBlock">
          {/* Explicitly using the new homeISO property */}
          <img 
            src={`https://flagcdn.com/w40/${match.homeISO?.toLowerCase()}.png`} 
            alt={`${match.homeCode} flag`} 
            style={{ width: "24px", height: "auto", borderRadius: "3px", objectFit: "contain" }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span className="codeText">{match.homeCode}</span>
        </div>

        <span className="vsSeparator">
          {hasStarted ? `${match.homeScore} - ${match.awayScore}` : "vs"}
        </span>

        <div className="teamCodeBlock">
          <span className="codeText">{match.awayCode}</span>
          {/* Explicitly using the new awayISO property */}
          <img 
            src={`https://flagcdn.com/w40/${match.awayISO?.toLowerCase()}.png`} 
            alt={`${match.awayCode} flag`} 
            style={{ width: "24px", height: "auto", borderRadius: "3px", objectFit: "contain" }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
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