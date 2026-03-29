const AVATAR_COLORS = [
  '#C4637A', '#5E7B62', '#7B6EA0', '#5B86A0',
  '#A07050', '#7A9088', '#A06070', '#4A7A6A',
];

function getAvatarColor(name) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function getInitials(name) {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  return words[0][0].toUpperCase();
}

export default function ParticipantCard({
  attendee,
  passDuckHandler,
  lateParticipantHandler,
  remaining,
  total,
}) {
  const done = total - remaining;

  return (
    <div className="duck-card">
      <div className="duck-card__content">
        {attendee.photoUrl ? (
          <img
            src={attendee.photoUrl}
            alt={attendee.name}
            className="duck-card__avatar-photo"
          />
        ) : (
          <div
            className="duck-card__avatar"
            style={{ backgroundColor: getAvatarColor(attendee.name) }}
            aria-hidden="true"
          >
            {getInitials(attendee.name)}
          </div>
        )}
        <p className="duck-card__name">{attendee.name}</p>
      </div>

      {total > 0 && (
        <div className="duck-card__progress">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`duck-card__progress-dot${i < done ? ' duck-card__progress-dot--done' : ''}`}
            />
          ))}
        </div>
      )}

      <div className="duck-card__actions">
        <button className="duck-btn duck-btn--primary" onClick={passDuckHandler} type="button">
          Pass the Duck
        </button>
        <button className="duck-btn duck-btn--secondary" onClick={lateParticipantHandler} type="button">
          Not Ready
        </button>
      </div>
    </div>
  );
}
