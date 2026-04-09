import { getInitials, getColor as getAvatarColor } from '../participants/InitialsAvatar';

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
        <span className="duck-card__subtitle">{done + 1} of {total}</span>
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
