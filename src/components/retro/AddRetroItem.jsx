import { useState } from 'react';
import { addRetroItem } from '../../utils/db-utils';

export default function AddRetroItem({ teamName, categoryId, currentParticipantId }) {
  const [text, setText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    await addRetroItem(teamName, {
      id: crypto.randomUUID(),
      categoryId,
      text: trimmed,
      authorId: currentParticipantId,
      createdAt: Date.now(),
    });
    setText('');
  };

  return (
    <form className="retro-add-item" onSubmit={handleSubmit}>
      <input
        className="retro-input"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add an item..."
      />
      <button
        type="submit"
        className="duck-btn duck-btn--primary retro-add-item__btn"
        disabled={!text.trim()}
      >
        Add
      </button>
    </form>
  );
}
