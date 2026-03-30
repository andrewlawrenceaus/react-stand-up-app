import InitialsAvatar from '../participants/InitialsAvatar';

export default function RetroParticipantSelect({ participants, onSelect }) {
  return (
    <div className="retro-participant-select">
      <div className="retro-participant-select__card">
        <h2 className="retro-participant-select__title">Who are you?</h2>
        <p className="retro-participant-select__subtitle">
          Select your name to join the retro
        </p>
        <div className="retro-participant-select__grid">
          {participants.map((participant) => (
            <button
              key={participant.id}
              className="retro-participant-select__option"
              onClick={() => onSelect(participant.id)}
            >
              {participant.photoUrl ? (
                <img
                  className="retro-participant-select__photo"
                  src={participant.photoUrl}
                  alt={participant.name}
                />
              ) : (
                <InitialsAvatar
                  name={participant.name}
                  sx={{ width: 56, height: 56, fontSize: '1.25rem' }}
                />
              )}
              <span className="retro-participant-select__name">
                {participant.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
