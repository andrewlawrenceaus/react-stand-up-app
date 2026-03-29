import { useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Link as RouterLink } from 'react-router-dom';
import InitialsAvatar from '../participants/InitialsAvatar';

export default function TeamCard({
  teamName,
  participants,
  allParticipants,
  addParticipant,
  removeParticipant,
  removeTeam,
  animationDelay = 0,
}) {
  const [editMode, setEditMode] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState(null);

  const addParticipantHandler = () => {
    if (selectedParticipantId) {
      addParticipant(teamName, selectedParticipantId);
      setSelectedParticipantId(null);
    }
  };

  const availableParticipants = allParticipants
    ? Object.values(allParticipants).filter(
        (p) => !participants || !participants.includes(p.id)
      )
    : [];

  const noParticipantsAtAll =
    !allParticipants || Object.keys(allParticipants).length === 0;

  return (
    <div className="team-card" style={{ animationDelay: `${animationDelay}ms` }}>
      <div className="team-card__header">
        <h2 className="team-card__name">{teamName}</h2>
        <div className="team-card__header-actions">
          <RouterLink to={`/?team=${teamName}`} className="team-card__link">
            Start Stand-Up
          </RouterLink>
          <button
            className="team-card__edit-btn"
            onClick={() => setEditMode(!editMode)}
            type="button"
          >
            {editMode ? '✕' : '✎'}
          </button>
        </div>
      </div>

      <ul className="team-card__list">
        {participants &&
          participants.map((participantId) => {
            const p = allParticipants ? allParticipants[participantId] : null;
            const name = p?.name || participantId;
            return (
              <li key={participantId} className="team-card__member">
                {p?.photoUrl ? (
                  <img
                    src={p.photoUrl}
                    alt={name}
                    className="team-member-photo"
                  />
                ) : (
                  <div
                    className="team-member-avatar"
                    style={{
                      backgroundColor: getAvatarColor(name),
                    }}
                    aria-hidden="true"
                  >
                    {getInitials(name)}
                  </div>
                )}
                <span className="team-card__member-name">{name}</span>
                {editMode && (
                  <button
                    className="team-card__member-delete"
                    aria-label="delete"
                    type="button"
                    onClick={() => removeParticipant(teamName, participantId)}
                  >
                    ✕
                  </button>
                )}
              </li>
            );
          })}
      </ul>

      {editMode && (
        <div className="team-card__edit-panel">
          {noParticipantsAtAll ? (
            <p className="team-card__edit-msg">
              No participants yet — add them on the{' '}
              <RouterLink to="/participants">Participants page</RouterLink>
            </p>
          ) : availableParticipants.length === 0 ? (
            <p className="team-card__edit-msg">
              All participants are already in this team
            </p>
          ) : (
            <div className="team-card__autocomplete">
              <Autocomplete
                options={availableParticipants}
                getOptionLabel={(option) => option.name}
                value={
                  availableParticipants.find(
                    (p) => p.id === selectedParticipantId
                  ) || null
                }
                onChange={(_, newValue) =>
                  setSelectedParticipantId(newValue ? newValue.id : null)
                }
                renderInput={(params) => (
                  <TextField {...params} label="Add Participant" size="small" />
                )}
                size="small"
              />
            </div>
          )}
          <div className="team-card__edit-footer">
            <button
              className="team-card__add-btn"
              onClick={addParticipantHandler}
              disabled={!selectedParticipantId}
              type="button"
            >
              Add Participant
            </button>
            <button
              className="team-card__delete-btn"
              onClick={() => removeTeam(teamName)}
              type="button"
            >
              Delete Team
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const AVATAR_COLORS = [
  '#C4637A', '#5E7B62', '#7B6EA0', '#5B86A0',
  '#A07050', '#7A9088', '#A06070', '#4A7A6A',
];

function getAvatarColor(name) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function getInitials(name) {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return words[0][0].toUpperCase();
}
