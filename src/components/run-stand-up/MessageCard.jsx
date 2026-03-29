import messageDuck from '../../assets/message-duck.jpg';
import './run-standup.css';

export default function MessageCard({ title, message }) {
  return (
    <div className="standup-page">
      <div className="standup-page__inner">
        <div className="message-card">
          <img
            src={messageDuck}
            title="message duck"
            alt="message duck"
            className="message-card__photo"
          />
          <div className="message-card__content">
            <h2 className="message-card__title">{title}</h2>
            <p className="message-card__text">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
