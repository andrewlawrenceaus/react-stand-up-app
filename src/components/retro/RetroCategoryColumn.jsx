import RetroCategoryEditor from './RetroCategoryEditor';
import RetroItem from './RetroItem';
import AddRetroItem from './AddRetroItem';

export default function RetroCategoryColumn({
  teamName,
  category,
  items,
  participants,
  currentParticipantId,
}) {
  const sortedItems = [...items].sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div className="retro-column">
      <RetroCategoryEditor
        teamName={teamName}
        category={category}
        itemCount={items.length}
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
