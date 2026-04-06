import InitialsAvatar from '../participants/InitialsAvatar';

export default function RetroParticipantSidebar({ participants, finishedParticipants }) {
  return (
    <aside className="retro-sidebar">
      <h2 className="retro-sidebar__title">Participants</h2>
      <ul className="retro-sidebar__list">
        {participants.map((participant) => {
          const isFinished = !!finishedParticipants[participant.id];
          return (
            <li
              key={participant.id}
              className={`retro-sidebar__item${isFinished ? ' retro-sidebar__item--finished' : ''}`}
            >
              <span className="retro-sidebar__avatar">
                {participant.photoUrl ? (
                  <img
                    src={participant.photoUrl}
                    alt={participant.name}
                    className="retro-sidebar__photo"
                  />
                ) : (
                  <InitialsAvatar name={participant.name} sx={{ width: 28, height: 28, fontSize: '0.65rem' }} />
                )}
              </span>
              <span className="retro-sidebar__name">{participant.name}</span>
              {isFinished && (
                <span className="retro-sidebar__tick" aria-label="finished">✓</span>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
