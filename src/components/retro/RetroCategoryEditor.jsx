import { useState } from 'react';
import { updateRetroCategory, removeRetroCategory, clearItemsByCategory } from '../../utils/db-utils';

export default function RetroCategoryEditor({ teamName, category, itemCount }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== category.name) {
      await updateRetroCategory(teamName, category.id, { name: trimmed });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditName(category.name);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    await removeRetroCategory(teamName, category.id);
    setShowDeleteConfirm(false);
  };

  const handleClear = async () => {
    await clearItemsByCategory(teamName, category.id);
  };

  return (
    <div className="retro-category-editor">
      {isEditing ? (
        <input
          className="retro-input retro-category-editor__input"
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <h3
          className="retro-category-editor__name"
          onClick={() => { setEditName(category.name); setIsEditing(true); }}
          title="Click to edit"
        >
          {category.name}
          {category.isProtected && <span className="retro-category-editor__lock" title="Cannot be deleted"> &#x1f512;</span>}
        </h3>
      )}

      <div className="retro-category-editor__actions">
        {itemCount > 0 && (
          <button
            className="retro-category-editor__btn"
            onClick={handleClear}
            title="Clear all items"
          >
            Clear
          </button>
        )}
        {!category.isProtected && !showDeleteConfirm && (
          <button
            className="retro-category-editor__btn retro-category-editor__btn--delete"
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete category"
          >
            &times;
          </button>
        )}
        {showDeleteConfirm && (
          <span className="retro-category-editor__confirm">
            Delete?
            <button className="retro-category-editor__btn retro-category-editor__btn--delete" onClick={handleDelete}>Yes</button>
            <button className="retro-category-editor__btn" onClick={() => setShowDeleteConfirm(false)}>No</button>
          </span>
        )}
      </div>
    </div>
  );
}
