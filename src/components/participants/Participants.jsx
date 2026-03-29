import { useState } from 'react';
import AddParticipant from './AddParticipant';
import ParticipantListItem from './ParticipantListItem';
import { writeParticipants } from '../../utils/db-utils';
import './participants.css';

export default function Participants({ initialParticipants }) {
  const [participants, setParticipants] = useState(initialParticipants || {});

  const handleAdd = (participant) => {
    const updatedParticipants = { ...participants, [participant.id]: participant };
    setParticipants(updatedParticipants);
    writeParticipants(updatedParticipants);
  };

  const handleDelete = (participantId) => {
    const updatedParticipants = { ...participants };
    delete updatedParticipants[participantId];
    setParticipants(updatedParticipants);
    writeParticipants(updatedParticipants);
  };

  const handlePhotoChange = (participantId, newPhotoUrl) => {
    setParticipants((prev) => {
      const updated = { ...prev, [participantId]: { ...prev[participantId], photoUrl: newPhotoUrl } };
      writeParticipants(updated);
      return updated;
    });
  };

  const handlePhotoRemove = (participantId) => {
    setParticipants((prev) => {
      const updated = { ...prev, [participantId]: { ...prev[participantId], photoUrl: '' } };
      writeParticipants(updated);
      return updated;
    });
  };

  const participantList = Object.values(participants);

  return (
    <div className="crew-page">
      <div className="crew-page__inner">
        <div className="crew-page__header">
          <h1 className="crew-page__title">The Flock</h1>
          <span className="crew-page__count">
            {participantList.length}{' '}
            {participantList.length === 1 ? 'participant' : 'participants'}
          </span>
        </div>

        <AddParticipant onAdd={handleAdd} />

        {participantList.length === 0 ? (
          <p className="crew-empty">No participants yet — add your first flock member above.</p>
        ) : (
          <div className="crew-grid">
            {participantList.map((participant, index) => (
              <ParticipantListItem
                key={participant.id}
                participant={participant}
                onDelete={handleDelete}
                onPhotoChange={handlePhotoChange}
                onPhotoRemove={handlePhotoRemove}
                animationDelay={index * 40}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
