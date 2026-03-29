import startDuck from '../../assets/duck-eggs.jpg';

export default function StartStandUpCard({ startStandUpHandler }) {
  return (
    <div className="duck-card">
      <img
        src={startDuck}
        title="start duck"
        alt="start duck"
        className="duck-card__photo"
      />
      <div className="duck-card__content">
        <p className="duck-card__subtitle">Ready when you are</p>
      </div>
      <div className="duck-card__actions">
        <button
          className="duck-btn duck-btn--primary"
          onClick={startStandUpHandler}
          type="button"
        >
          Start Stand Up
        </button>
      </div>
    </div>
  );
}
