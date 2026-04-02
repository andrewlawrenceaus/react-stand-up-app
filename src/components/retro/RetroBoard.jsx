import { useState, useEffect, useCallback } from 'react';
import { subscribeToActiveRetro } from '../../utils/db-utils';
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import RetroSetup from './RetroSetup';
import RetroParticipantSelect from './RetroParticipantSelect';
import RetroCategoryColumn from './RetroCategoryColumn';
import RetroTimer from './RetroTimer';
import RetroActions from './RetroActions';

function getSessionParticipant(teamName) {
  return sessionStorage.getItem(`retro-participant-${teamName}`);
}

function setSessionParticipant(teamName, participantId) {
  sessionStorage.setItem(`retro-participant-${teamName}`, participantId);
}

function clearSessionParticipant(teamName) {
  sessionStorage.removeItem(`retro-participant-${teamName}`);
}

export default function RetroBoard({ teamName, participants, isParticipant = false, participantId, ownerUID }) {
  const [retroState, setRetroState] = useState(undefined);
  const [selectedParticipantId, setSelectedParticipantId] = useState(
    () => isParticipant ? participantId : getSessionParticipant(teamName)
  );

  useEffect(() => {
    setRetroState(undefined);
    if (!isParticipant) {
      const stored = getSessionParticipant(teamName);
      setSelectedParticipantId(stored);
    }
    const unsubscribe = subscribeToActiveRetro(teamName, (data) => {
      setRetroState(data);
    }, ownerUID);
    return unsubscribe;
  }, [teamName, isParticipant, ownerUID]);

  const handleSelectParticipant = useCallback((id) => {
    setSessionParticipant(teamName, id);
    setSelectedParticipantId(id);
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

  // No active retro
  if (!retroState) {
    if (isParticipant) {
      return (
        <div className="retro-waiting">
          Waiting for the team lead to start the retro…
        </div>
      );
    }
    return <RetroSetup teamName={teamName} participants={participants} />;
  }

  // Active retro but no participant selected (or invalid selection)
  const validParticipantIds = participants.map(p => p.id);
  const isValidSelection = selectedParticipantId && validParticipantIds.includes(selectedParticipantId);

  if (!isValidSelection) {
    if (isParticipant) {
      // Participant ID not in team — shouldn't happen in normal flow
      return (
        <div className="retro-waiting">
          Your participant profile was not found in this team.
        </div>
      );
    }
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
  const items = retroState.items && typeof retroState.items === 'object'
    ? Object.values(retroState.items)
    : [];

  // Find the protected (Action Items) category
  const protectedCategory = categories.find(c => c.isProtected);

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
          {!isParticipant && (
            <button
              className="retro-board__change-btn"
              onClick={handleChangeParticipant}
            >
              Change
            </button>
          )}
        </div>
        <RetroTimer teamName={teamName} retroState={retroState} isParticipant={isParticipant} />
      </div>

      <RetroActions
        teamName={teamName}
        protectedCategoryId={protectedCategory?.id}
        isParticipant={isParticipant}
      />

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
                isParticipant={isParticipant}
                ownerUID={ownerUID}
              />
            ))}
            {!isParticipant && <AddCategoryButton teamName={teamName} nextOrder={categories.length} />}
          </div>
        </SortableContext>
      </DndContext>
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
