import { useState, useEffect, useCallback } from 'react';
import { subscribeToActiveRetro } from '../../utils/db-utils';
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import RetroSetup from './RetroSetup';
import RetroParticipantSelect from './RetroParticipantSelect';
import RetroCategoryColumn from './RetroCategoryColumn';
import RetroTimer from './RetroTimer';
import RetroActions from './RetroActions';
import RetroParticipantSidebar from './RetroParticipantSidebar';

function getSessionParticipant(teamName) {
  return sessionStorage.getItem(`retro-participant-${teamName}`);
}

function setSessionParticipant(teamName, participantId) {
  sessionStorage.setItem(`retro-participant-${teamName}`, participantId);
}

function clearSessionParticipant(teamName) {
  sessionStorage.removeItem(`retro-participant-${teamName}`);
}

export default function RetroBoard({ teamName, participants }) {
  const [retroState, setRetroState] = useState(undefined);
  const [selectedParticipantId, setSelectedParticipantId] = useState(
    () => getSessionParticipant(teamName)
  );
  const [filterParticipantId, setFilterParticipantId] = useState(null);

  useEffect(() => {
    setRetroState(undefined);
    const stored = getSessionParticipant(teamName);
    setSelectedParticipantId(stored);
    const unsubscribe = subscribeToActiveRetro(teamName, (data) => {
      setRetroState(data);
    });
    return unsubscribe;
  }, [teamName]);

  const handleSelectParticipant = useCallback((participantId) => {
    setSessionParticipant(teamName, participantId);
    setSelectedParticipantId(participantId);
  }, [teamName]);

  const handleChangeParticipant = useCallback(() => {
    clearSessionParticipant(teamName);
    setSelectedParticipantId(null);
  }, [teamName]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // Loading state
  if (retroState === undefined) {
    return <div className="retro-loading">Loading...</div>;
  }

  // No active retro — show setup
  if (!retroState) {
    return <RetroSetup teamName={teamName} participants={participants} />;
  }

  // Active retro but no participant selected (or invalid selection)
  const validParticipantIds = participants.map(p => p.id);
  const isValidSelection = selectedParticipantId && validParticipantIds.includes(selectedParticipantId);

  if (!isValidSelection) {
    return (
      <RetroParticipantSelect
        participants={participants}
        onSelect={handleSelectParticipant}
      />
    );
  }

  const currentParticipant = participants.find(p => p.id === selectedParticipantId);

  // Parse categories and items from retro state
  const categories = retroState.categories
    ? Object.values(retroState.categories).sort((a, b) => a.order - b.order)
    : [];
  const allItems = retroState.items && typeof retroState.items === 'object'
    ? Object.values(retroState.items)
    : [];
  const items = filterParticipantId
    ? allItems.filter(item =>
        item.authorId === filterParticipantId ||
        item.agreedBy?.[filterParticipantId]
      )
    : allItems;

  // Find the protected (Action Items) category
  const protectedCategory = categories.find(c => c.isProtected);

  const finishedParticipants = retroState.finishedParticipants || {};

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex(c => c.id === active.id);
    const newIndex = categories.findIndex(c => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex);
    const { reorderRetroCategories } = await import('../../utils/db-utils');
    await reorderRetroCategories(teamName, reordered.map(c => c.id));
  };

  return (
    <div className="retro-board">
      <div className="retro-board__header">
        <div className="retro-board__identity">
          You are: <strong>{currentParticipant.name}</strong>
          <button
            className="retro-board__change-btn"
            onClick={handleChangeParticipant}
          >
            Change
          </button>
        </div>
        <div className="retro-board__filter">
          <label className="retro-board__filter-label" htmlFor="retro-participant-filter">
            Filter:
          </label>
          <select
            id="retro-participant-filter"
            className="retro-board__filter-select"
            value={filterParticipantId ?? ''}
            onChange={e => setFilterParticipantId(e.target.value || null)}
          >
            <option value="">All participants</option>
            {participants.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <RetroTimer teamName={teamName} retroState={retroState} />
      </div>

      <RetroActions
        teamName={teamName}
        protectedCategoryId={protectedCategory?.id}
        participants={participants}
        finishedParticipants={finishedParticipants}
        currentParticipantId={selectedParticipantId}
      />

      <div className="retro-board__content">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={categories.map(c => c.id)} strategy={horizontalListSortingStrategy}>
            <div className="retro-board__columns">
              {categories.map((category) => (
                <RetroCategoryColumn
                  key={category.id}
                  teamName={teamName}
                  category={category}
                  items={items.filter(item => item.categoryId === category.id)}
                  participants={participants}
                  currentParticipantId={selectedParticipantId}
                  categoryCount={categories.length}
                />
              ))}
              <AddCategoryButton teamName={teamName} nextOrder={categories.length} />
            </div>
          </SortableContext>
        </DndContext>

        <RetroParticipantSidebar
          participants={participants}
          finishedParticipants={finishedParticipants}
        />
      </div>
    </div>
  );
}

function AddCategoryButton({ teamName, nextOrder }) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const { addRetroCategory } = await import('../../utils/db-utils');
    await addRetroCategory(teamName, {
      id: crypto.randomUUID(),
      name: trimmed,
      order: nextOrder,
      isProtected: false,
    });
    setName('');
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <button
        className="retro-board__add-category-btn"
        onClick={() => setIsAdding(true)}
      >
        + Add Category
      </button>
    );
  }

  return (
    <form className="retro-board__add-category-form" onSubmit={handleSubmit}>
      <input
        className="retro-input"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category name"
        autoFocus
      />
      <div className="retro-board__add-category-actions">
        <button type="submit" className="duck-btn duck-btn--primary">Add</button>
        <button
          type="button"
          className="duck-btn duck-btn--secondary"
          onClick={() => { setIsAdding(false); setName(''); }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
