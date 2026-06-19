import React from "react";
import { Trophy, Star, Bell, Clock, MapPin } from "lucide-react";
import { formatKickoff, getCountdown } from "../utils/dateUtils";

export default function MatchDetails({ activeMatch, followedTeams, toggleFollow, now, onSimulateGoal }) {
  // Guard case if no match is selected or available
  if (!activeMatch) {
    return (
      <div className="card emptyDetails">
        <p className="muted">Select a match from the fixtures list to view live timelines and full details.</p>
      </div>
    );
  }

  const isFinished = activeMatch.status === "FT";
  const isLive = activeMatch.status === "LIVE";
  const hasStarted = isFinished || isLive;

  return (
    <div className="card matchDetailsDisplay">
      {/* Card Header Section */}
      <div className="sectionTitle">
        <Trophy size={20} className="iconAccent" />
        <h2>Match Details</h2>
      </div>

      <div className="detailContent">
        <span className="groupPillHeader">{activeMatch.group}</span>
        
        {/* Large Scoreboard Banner Layout */}
        <div className="scoreboardBanner">
          
          {/* Home Team Side */}
          <div className="scoreboardTeam">
            <img 
              src={`https://flagcdn.com/w80/${activeMatch.homeISO?.toLowerCase()}.png`} 
              alt={`${activeMatch.homeCode} flag`} 
              style={{ width: '64px', height: 'auto', borderRadius: '6px', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h3>{activeMatch.home}</h3>
          </div>

          {/* Center Score / VS Tag */}
          <div className="scoreboardCenter">
            {hasStarted ? (
              <h1 className="liveScoreText">
                {activeMatch.homeScore} : {activeMatch.awayScore}
              </h1>
            ) : (
              <span className="vsBadgeText">VS</span>
            )}
            
            {isLive && <span className="liveTimerBadge">Minute {activeMatch.minute}'</span>}
          </div>

          {/* Away Team Side */}
          <div className="scoreboardTeam">
            <img 
              src={`https://flagcdn.com/w80/${activeMatch.awayISO?.toLowerCase()}.png`} 
              alt={`${activeMatch.awayCode} flag`} 
              style={{ width: '64px', height: 'auto', borderRadius: '6px', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h3>{activeMatch.away}</h3>
          </div>
        </div>

        {/* Dynamic Goalscorers Timeline Area */}
        {hasStarted && activeMatch.goals && activeMatch.goals.length > 0 && (
          <div className="matchTimelineContainer">
            <h4>⚽ Goals & Match Events</h4>
            <div className="goalsList">
              {activeMatch.goals.map((goal, idx) => (
                <div key={idx} className={`goalEventRow ${goal.team === activeMatch.homeCode ? 'homeSide' : 'awaySide'}`}>
                  <span className="eventMinute">{goal.minute}'</span>
                  <span className="eventPlayer"><strong>{goal.player}</strong> ({goal.team})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <hr className="subtleDivider" />

        {/* Informational Data Rows */}
        <div className="metaInfoGrid">
          <p>
            <Clock size={16} /> 
            <strong>Status:</strong> 
            <span className={`statusTextString ${activeMatch.status.toLowerCase()}`}>
              {isFinished ? " Match ended (FT)" : isLive ? " Live Now" : " Scheduled"}
            </span>
          </p>
          
          <p>
            <MapPin size={16} /> 
            <strong>Venue:</strong> {activeMatch.venue}
          </p>

          {!isFinished && (
            <>
              <p><strong>Kickoff Time:</strong> {formatKickoff(activeMatch.kickoffUTC)}</p>
              <p className="countdownText"><strong>Countdown:</strong> {getCountdown(activeMatch.kickoffUTC, now)}</p>
            </>
          )}
        </div>

        {/* Team Follow Actions */}
        <div className="actionButtonsContainer">
          <button 
            className={`followActionButton ${followedTeams.includes(activeMatch.homeCode) ? 'following' : ''}`}
            onClick={() => toggleFollow(activeMatch.homeCode)}
          >
            <Star size={14} />
            {followedTeams.includes(activeMatch.homeCode) ? `Following ${activeMatch.homeCode}` : `Follow ${activeMatch.homeCode}`}
          </button>

          <button 
            className={`followActionButton ${followedTeams.includes(activeMatch.awayCode) ? 'following' : ''}`}
            onClick={() => toggleFollow(activeMatch.awayCode)}
          >
            <Star size={14} />
            {followedTeams.includes(activeMatch.awayCode) ? `Following ${activeMatch.awayCode}` : `Follow ${activeMatch.awayCode}`}
          </button>
        </div>

        {/* Notification Simulator Trigger */}
        {!isFinished && (
          <button className="goalBtn simulationTrigger" onClick={() => onSimulateGoal(activeMatch)}>
            <Bell size={14} />
            Simulate Live Goal Notification
          </button>
        )}
      </div>
    </div>
  );
}