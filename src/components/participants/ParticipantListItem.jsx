import { useRef, useState } from 'react';
import InitialsAvatar from './InitialsAvatar';
import { uploadParticipantPhoto } from '../../utils/db-utils';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function ParticipantListItem({
  participant,
  onDelete,
  onPhotoChange = () => {},
  onPhotoRemove = () => {},
  animationDelay = 0,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setIsUploading(true);
    try {
      const url = await uploadParticipantPhoto(participant.id, file);
      onPhotoChange(participant.id, url);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className="crew-card"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <button
        className="crew-card__delete"
        aria-label="delete"
        onClick={() => onDelete(participant.id)}
        type="button"
      >
        ✕
      </button>

      <div className="avatar-wrap">
        {participant.photoUrl ? (
          <img
            src={participant.photoUrl}
            alt={participant.name}
            className="photo-avatar"
          />
        ) : (
          <InitialsAvatar name={participant.name} />
        )}

        {isUploading ? (
          <div className="avatar-overlay avatar-overlay--busy" aria-label="Uploading…" />
        ) : (
          <div className="avatar-overlay" aria-hidden="true">
            <label className="avatar-overlay__btn" aria-label="Change photo">
              ✎
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
            </label>
            {participant.photoUrl && (
              <button
                className="avatar-overlay__btn"
                aria-label="Remove photo"
                onClick={() => onPhotoRemove(participant.id)}
                type="button"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      <span className="crew-card__name">{participant.name}</span>
    </div>
  );
}
