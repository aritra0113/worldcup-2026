import { useMemo } from "react";

export function useStandings(matches, groups) {
  return useMemo(() => {
    // 1. Setup empty standings skeleton for all groups & teams
    const standings = {};
    groups.forEach(g => {
      standings[g.name] = {};
      g.teams.forEach(t => {
        standings[g.name][t.code] = { 
          ...t, 
          played: 0, 
          win: 0, 
          draw: 0, 
          loss: 0, 
          gf: 0, 
          ga: 0, 
          gd: 0, 
          points: 0 
        };
      });
    });

    // 2. Loop through all matches that have recorded scores
    matches.forEach(m => {
      // Only calculate if the match has started and has scores
      if (m.homeScore !== null && m.awayScore !== null) {
        const home = standings[m.group]?.[m.homeCode];
        const away = standings[m.group]?.[m.awayCode];

        if (home && away) {
          home.played += 1;
          away.played += 1;
          home.gf += m.homeScore;
          away.gf += m.awayScore;
          home.ga += m.awayScore;
          away.ga += m.homeScore;

          // Win/Loss/Draw Logic
          if (m.homeScore > m.awayScore) {
            home.win += 1;
            away.loss += 1;
            home.points += 3;
          } else if (m.homeScore < m.awayScore) {
            away.win += 1;
            home.loss += 1;
            away.points += 3;
          } else {
            home.draw += 1;
            away.draw += 1;
            home.points += 1;
            away.points += 1;
          }

          // Goal Difference
          home.gd = home.gf - home.ga;
          away.gd = away.gf - away.ga;
        }
      }
    });

    // 3. Convert object to arrays and sort by Points -> Goal Diff -> Goals For
    return Object.keys(standings).map(groupName => {
      const teamArray = Object.values(standings[groupName]);
      
      teamArray.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points; // Sort by Points
        if (b.gd !== a.gd) return b.gd - a.gd;                 // Tie-breaker 1: GD
        return b.gf - a.gf;                                    // Tie-breaker 2: GF
      });

      return { name: groupName, teams: teamArray };
    }).sort((a, b) => a.name.localeCompare(b.name));
    
  }, [matches, groups]); // Re-runs instantly if matches or groups data changes
}