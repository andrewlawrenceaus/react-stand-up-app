import finishedDuck from '../../assets/sunset-ducks.jpg';

export default function StandUpCompleteCard({ resetStandUpHandler }) {
  return (
    <div className="duck-card">
      <img
        src={finishedDuck}
        title="finished-duck"
        alt="finished duck"
        className="duck-card__photo"
      />
      <div className="duck-card__content">
        <p className="duck-card__name">Finished!</p>
        <p className="duck-card__subtitle">Everyone has spoken</p>
      </div>
      <div className="duck-card__actions">
        <button
          className="duck-btn duck-btn--secondary"
          onClick={resetStandUpHandler}
          type="button"
        >
          Reset Stand Up
        </button>
      </div>
    </div>
  );
}
