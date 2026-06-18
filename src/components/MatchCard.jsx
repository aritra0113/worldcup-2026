import { flags } from "../data/matches";
import {
  formatKickoff,
  formatDateOnly,
  getCountdown
} from "../utils/dateUtils";

function MatchCard({ match, active, now, onClick }) {
  return (
    <button className={`matchCard ${active ? "active" : ""}`} onClick={onClick}>
      <div className="matchTop">
        <span className="datePill">{formatDateOnly(match.kickoffUTC)}</span>
        <span className="groupTag">{match.group}</span>
      </div>

      <div className="matchTeams">
        <strong>{flags[match.homeCode] || "⚽"} {match.homeCode}</strong>
        <span>vs</span>
        <strong>{flags[match.awayCode] || "⚽"} {match.awayCode}</strong>
      </div>

      <p>{match.home} vs {match.away}</p>

      <small>{formatKickoff(match.kickoffUTC)}</small>

      <span className="countdownText">
        {getCountdown(match.kickoffUTC, now)}
      </span>
    </button>
  );
}

export default MatchCard;