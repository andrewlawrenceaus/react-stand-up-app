import { useState } from 'react';
import { completeRetro, clearAllItemsExceptCategory } from '../../utils/db-utils';

export default function RetroActions({
  teamName,
  protectedCategoryId,
  participants,
  finishedParticipants,
  currentParticipantId,
}) {
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showUnfinishedWarning, setShowUnfinishedWarning] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const isFinished = !!finishedParticipants[currentParticipantId];
  const unfinishedParticipants = participants.filter((p) => !finishedParticipants[p.id]);

  const handleToggleFinished = async () => {
    const { toggleFinished } = await import('../../utils/db-utils');
    await toggleFinished(teamName, currentParticipantId);
  };

  const handleCompleteClick = () => {
    if (unfinishedParticipants.length > 0) {
      setShowUnfinishedWarning(true);
    } else {
      setShowCompleteConfirm(true);
    }
  };

  const handleComplete = async () => {
    await completeRetro(teamName);
    setShowCompleteConfirm(false);
    setShowUnfinishedWarning(false);
  };

  const handleClearAll = async () => {
    if (protectedCategoryId) {
      await clearAllItemsExceptCategory(teamName, protectedCategoryId);
      setShowClearConfirm(false);
    }
  };

  return (
    <div className="retro-actions">
      {protectedCategoryId && (
        !showClearConfirm ? (
          <button className="duck-btn duck-btn--destructive" onClick={() => setShowClearConfirm(true)}>
            Clear All (keep Action Items)
          </button>
        ) : (
          <span className="retro-actions__confirm">
            <span>Clear all items except Action Items?</span>
            <button className="duck-btn duck-btn--primary" onClick={handleClearAll}>
              Yes, Clear All
            </button>
            <button
              className="duck-btn duck-btn--secondary"
              onClick={() => setShowClearConfirm(false)}
            >
              Cancel
            </button>
          </span>
        )
      )}

      <button
        className={`duck-btn retro-actions__finished-btn${isFinished ? ' retro-actions__finished-btn--active' : ''}`}
        onClick={handleToggleFinished}
      >
        {isFinished ? '✓ I\'m Finished' : 'I\'m Finished'}
      </button>

      {!showCompleteConfirm && !showUnfinishedWarning ? (
        <button className="duck-btn duck-btn--primary" onClick={handleCompleteClick}>
          Complete Retro
        </button>
      ) : showUnfinishedWarning ? (
        <span className="retro-actions__confirm">
          <span>
            Still waiting on:{' '}
            <strong>{unfinishedParticipants.map((p) => p.name).join(', ')}</strong>
          </span>
          <button className="duck-btn duck-btn--primary" onClick={handleComplete}>
            Complete Anyway
          </button>
          <button
            className="duck-btn duck-btn--secondary"
            onClick={() => setShowUnfinishedWarning(false)}
          >
            Cancel
          </button>
        </span>
      ) : (
        <span className="retro-actions__confirm">
          <span>Save and end this retro?</span>
          <button className="duck-btn duck-btn--primary" onClick={handleComplete}>
            Yes, Complete
          </button>
          <button
            className="duck-btn duck-btn--secondary"
            onClick={() => setShowCompleteConfirm(false)}
          >
            Cancel
          </button>
        </span>
      )}
    </div>
  );
}
