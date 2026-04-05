export function resolveTeamParticipants(teamIds, allParticipants) {
  if (!teamIds || !Array.isArray(teamIds)) return [];
  return teamIds.map(id => allParticipants[id]).filter(Boolean);
}
