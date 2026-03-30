import { useState, useEffect } from 'react';
import { createRetro, getPreviousRetro } from '../../utils/db-utils';

const DEFAULT_CATEGORIES = [
  'What went well',
  'What didn\'t go well',
  'What should we do differently',
];

function buildCategories(names) {
  const categories = {};
  names.forEach((name, index) => {
    const id = crypto.randomUUID();
    categories[id] = { id, name, order: index, isProtected: false };
  });
  // Always add Action Items as the last protected category
  const actionId = crypto.randomUUID();
  categories[actionId] = {
    id: actionId,
    name: 'Action Items',
    order: names.length,
    isProtected: true,
  };
  return categories;
}

export default function RetroSetup({ teamName, participants }) {
  const [categoryNames, setCategoryNames] = useState([...DEFAULT_CATEGORIES]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [timerMinutes, setTimerMinutes] = useState('');
  const [previousRetro, setPreviousRetro] = useState(null);
  const [carryOver, setCarryOver] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPreviousRetro(teamName).then((retro) => {
      if (!cancelled) setPreviousRetro(retro);
    });
    return () => { cancelled = true; };
  }, [teamName]);

  const handleAddCategory = (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    setCategoryNames(prev => [...prev, trimmed]);
    setNewCategoryName('');
  };

  const handleRemoveCategory = (index) => {
    setCategoryNames(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditCategory = (index, value) => {
    setCategoryNames(prev => prev.map((name, i) => i === index ? value : name));
  };

  const handleStart = async () => {
    setIsStarting(true);
    const duration = timerMinutes ? parseInt(timerMinutes, 10) * 60 : null;

    let categories;
    let items = false;

    if (carryOver && previousRetro?.categories && previousRetro?.items) {
      // Carry over previous retro's categories and items
      categories = {};
      const prevCategories = Object.values(previousRetro.categories);
      prevCategories.forEach((cat, index) => {
        categories[cat.id] = { ...cat, order: index };
      });
      items = previousRetro.items;
    } else {
      categories = buildCategories(categoryNames);
    }

    await createRetro(teamName, { categories, timerDuration: duration });
    setIsStarting(false);
  };

  const previousItemCount = previousRetro?.items
    ? Object.keys(previousRetro.items).length
    : 0;

  return (
    <div className="retro-setup">
      <div className="retro-setup__card">
        <h2 className="retro-setup__title">Start a Retro</h2>
        <p className="retro-setup__subtitle">{teamName}</p>

        {previousRetro && previousItemCount > 0 && (
          <div className="retro-setup__previous">
            <p className="retro-setup__previous-label">
              Previous retro from {previousRetro.date} ({previousItemCount} items)
            </p>
            <label className="retro-setup__toggle">
              <input
                type="checkbox"
                checked={carryOver}
                onChange={(e) => setCarryOver(e.target.checked)}
              />
              Carry over previous items
            </label>
          </div>
        )}

        {!carryOver && (
          <div className="retro-setup__categories">
            <h3 className="retro-setup__section-title">Categories</h3>
            <ul className="retro-setup__category-list">
              {categoryNames.map((name, index) => (
                <li key={index} className="retro-setup__category-item">
                  <input
                    className="retro-input retro-input--inline"
                    type="text"
                    value={name}
                    onChange={(e) => handleEditCategory(index, e.target.value)}
                  />
                  <button
                    className="retro-setup__remove-btn"
                    onClick={() => handleRemoveCategory(index)}
                    aria-label={`Remove ${name}`}
                  >
                    &times;
                  </button>
                </li>
              ))}
              <li className="retro-setup__category-item retro-setup__category-item--locked">
                Action Items (always included)
              </li>
            </ul>
            <form className="retro-setup__add-form" onSubmit={handleAddCategory}>
              <input
                className="retro-input"
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Add another category"
              />
              <button type="submit" className="duck-btn duck-btn--secondary">
                Add
              </button>
            </form>
          </div>
        )}

        <div className="retro-setup__timer">
          <h3 className="retro-setup__section-title">Timer (optional)</h3>
          <div className="retro-setup__timer-input">
            <input
              className="retro-input"
              type="number"
              min="1"
              max="120"
              value={timerMinutes}
              onChange={(e) => setTimerMinutes(e.target.value)}
              placeholder="Minutes"
            />
            <span className="retro-setup__timer-label">minutes</span>
          </div>
        </div>

        <button
          className="duck-btn duck-btn--primary retro-setup__start-btn"
          onClick={handleStart}
          disabled={isStarting || (!carryOver && categoryNames.length === 0)}
        >
          {isStarting ? 'Starting...' : 'Start Retro'}
        </button>
      </div>
    </div>
  );
}
