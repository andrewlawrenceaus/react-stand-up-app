import { useState } from 'react';
import { completeRetro, clearAllItemsExceptCategory } from '../../utils/db-utils';

export default function RetroActions({ teamName, protectedCategoryId, isParticipant }) {
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  const handleComplete = async () => {
    await completeRetro(teamName);
    setShowCompleteConfirm(false);
  };

  const handleClearAll = async () => {
    if (protectedCategoryId) {
      await clearAllItemsExceptCategory(teamName, protectedCategoryId);
    }
  };

  if (isParticipant) return null;

  return (
    <div className="retro-actions">
      {protectedCategoryId && (
        <button
          className="duck-btn duck-btn--secondary"
          onClick={handleClearAll}
        >
          Clear All (keep Action Items)
        </button>
      )}

      {!showCompleteConfirm ? (
        <button
          className="duck-btn duck-btn--primary"
          onClick={() => setShowCompleteConfirm(true)}
        >
          Complete Retro
        </button>
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
