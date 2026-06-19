export function formatKickoff(utc) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(utc));
}

export function formatDateOnly(utc) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short"
  }).format(new Date(utc));
}

export function sameLocalDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getCountdown(utc, now = new Date()) {
  const kickoff = new Date(utc);
  const diff = kickoff - now;

  if (diff <= 0) {
    return "Match started";
  }

  const totalSeconds = Math.floor(diff / 1000);

  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `Starts in ${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `Starts in ${hours}h ${minutes}m ${seconds}s`;
  }

  return `Starts in ${minutes}m ${seconds}s`;
}