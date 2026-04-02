import RetroCategoryEditor from './RetroCategoryEditor';
import RetroItem from './RetroItem';
import AddRetroItem from './AddRetroItem';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function RetroCategoryColumn({
  teamName,
  category,
  items,
  participants,
  currentParticipantId,
}) {
  const sortedItems = [...items].sort((a, b) => a.createdAt - b.createdAt);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });
  const style = { transform: CSS.Transform.toString(transform), transition: transform ? transition : undefined };

  return (
    <div
      className={`retro-column${isDragging ? ' retro-column--dragging' : ''}`}
      ref={setNodeRef}
      style={style}
    >
      <RetroCategoryEditor
        teamName={teamName}
        category={category}
        itemCount={items.length}
        dragHandleListeners={listeners}
        dragHandleAttributes={attributes}
      />

      <div className="retro-column__items">
        {sortedItems.map((item) => (
          <RetroItem
            key={item.id}
            teamName={teamName}
            item={item}
            participants={participants}
            currentParticipantId={currentParticipantId}
          />
        ))}
      </div>

      <AddRetroItem
        teamName={teamName}
        categoryId={category.id}
        currentParticipantId={currentParticipantId}
      />
    </div>
  );
}
