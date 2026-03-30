import { useState } from 'react';
import InitialsAvatar from '../participants/InitialsAvatar';
import { toggleAgree, updateRetroItem, removeRetroItem } from '../../utils/db-utils';

export default function RetroItem({ teamName, item, participants, currentParticipantId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleEditSave = async () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== item.text) {
      await updateRetroItem(teamName, item.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') handleEditSave();
    if (e.key === 'Escape') {
      setEditText(item.text);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    removeRetroItem(teamName, item.id);
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

        {isAuthor && !isEditing && (
          <div className="retro-item__owner-actions">
            <button
              className="retro-item__owner-btn"
              onClick={() => { setEditText(item.text); setIsEditing(true); }}
              aria-label="Edit item"
            >
              Edit
            </button>
            {!showDeleteConfirm ? (
              <button
                className="retro-item__owner-btn retro-item__owner-btn--delete"
                onClick={() => setShowDeleteConfirm(true)}
                aria-label="Delete item"
              >
                Delete
              </button>
            ) : (
              <>
                <button
                  className="retro-item__owner-btn retro-item__owner-btn--delete"
                  onClick={handleDelete}
                  aria-label="Confirm delete"
                >
                  Yes
                </button>
                <button
                  className="retro-item__owner-btn"
                  onClick={() => setShowDeleteConfirm(false)}
                  aria-label="Cancel delete"
                >
                  No
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <textarea
          className="retro-input retro-item__edit-input"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleEditSave}
          onKeyDown={handleEditKeyDown}
          autoFocus
          rows={2}
        />
      ) : (
        <p className="retro-item__text">{item.text}</p>
      )}

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
