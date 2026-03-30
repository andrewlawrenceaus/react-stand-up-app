import InitialsAvatar from '../participants/InitialsAvatar';
import { toggleAgree } from '../../utils/db-utils';

export default function RetroItem({ teamName, item, participants, currentParticipantId }) {
  const author = participants.find(p => p.id === item.authorId);
  const agreedByIds = item.agreedBy ? Object.keys(item.agreedBy) : [];
  const agreedParticipants = agreedByIds
    .map(id => participants.find(p => p.id === id))
    .filter(Boolean);
  const hasAgreed = agreedByIds.includes(currentParticipantId);
  const isAuthor = item.authorId === currentParticipantId;

  const handleToggleAgree = () => {
    toggleAgree(teamName, item.id, currentParticipantId);
  };

  return (
    <div className="retro-item">
      <div className="retro-item__author">
        {author && (
          <>
            {author.photoUrl ? (
              <img
                className="retro-item__author-photo"
                src={author.photoUrl}
                alt={author.name}
              />
            ) : (
              <InitialsAvatar
                name={author.name}
                sx={{ width: 28, height: 28, fontSize: '0.7rem' }}
              />
            )}
            <span className="retro-item__author-name">{author.name}</span>
          </>
        )}
      </div>

      <p className="retro-item__text">{item.text}</p>

      <div className="retro-item__footer">
        {!isAuthor && (
          <button
            className={`retro-item__agree-btn ${hasAgreed ? 'retro-item__agree-btn--agreed' : ''}`}
            onClick={handleToggleAgree}
          >
            {hasAgreed ? 'Agreed' : 'Agree'}
          </button>
        )}

        {agreedParticipants.length > 0 && (
          <div className="retro-item__agreed-list">
            {agreedParticipants.map((p) => (
              <span key={p.id} className="retro-item__agreed-avatar" title={p.name}>
                {p.photoUrl ? (
                  <img
                    className="retro-item__agreed-photo"
                    src={p.photoUrl}
                    alt={p.name}
                  />
                ) : (
                  <InitialsAvatar
                    name={p.name}
                    sx={{ width: 22, height: 22, fontSize: '0.55rem' }}
                  />
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
