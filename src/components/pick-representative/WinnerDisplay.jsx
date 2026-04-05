import InitialsAvatar from '../participants/InitialsAvatar';

export default function WinnerDisplay({ winner, onReset }) {
  return (
    <div className="pick-rep__winner duck-card">
      <div className="duck-card__content">
        {winner.photoUrl ? (
          <img
            src={winner.photoUrl}
            alt={winner.name}
            className="duck-card__avatar-photo"
          />
        ) : (
          <InitialsAvatar
            name={winner.name}
            sx={{ width: 140, height: 140, fontSize: '3rem' }}
          />
        )}
        <p className="duck-card__name">{winner.name}</p>
        <p className="duck-card__subtitle">Selected Representative</p>
      </div>
      <div className="duck-card__actions">
        <button className="duck-btn duck-btn--secondary" onClick={onReset}>
          Spin Again
        </button>
      </div>
    </div>
  );
}
