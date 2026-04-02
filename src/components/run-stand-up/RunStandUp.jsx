import { useContext, useEffect, useState } from 'react';
import ParticipantCard from './ParticipantCard';
import StartStandUpCard from './StartStandUpCard';
import StandUpCompleteCard from './StandUpCompleteCard';
import ShareLinksModal from '../standup/ShareLinksModal';
import { AuthContext } from '../store/AuthProvider';
import { generateAllInviteTokens } from '../../utils/db-utils-tokens';
import './run-standup.css';

export default function RunStandUp({ participants, team }) {
  const [standUpParticipants, setStandUpParticipants] = useState(
    initialiseParticipants(participants)
  );
  const [standUpStatus, setStandUpStatus] = useState('Ready');
  const [shareLinksOpen, setShareLinksOpen] = useState(false);
  const [participantsWithTokens, setParticipantsWithTokens] = useState(participants);
  const { user } = useContext(AuthContext);

  const passDuckHandler = () => {
    let updated = standUpParticipants.slice();
    updated.splice(0, 1);
    if (updated.length > 0) {
      setStandUpParticipants(updated);
    } else {
      setStandUpParticipants(initialiseParticipants(participants));
      setStandUpStatus('Complete');
    }
  };

  const lateParticipantHandler = () => {
    let updated = standUpParticipants.slice();
    const late = updated.splice(0, 1);
    updated.push(...late);
    setStandUpParticipants(updated);
  };

  const startStandUpHandler = () => setStandUpStatus('In Progress');
  const resetStandUpHandler = () => setStandUpStatus('Ready');

  useEffect(() => {
    setStandUpParticipants(initialiseParticipants(participants));
    setStandUpStatus('Ready');
    setParticipantsWithTokens(participants);
  }, [participants]);

  const handleShareLinks = async () => {
    const updated = await generateAllInviteTokens(user.uid, [...participantsWithTokens]);
    setParticipantsWithTokens(updated);
    setShareLinksOpen(true);
  };

  const remaining = standUpParticipants.length;
  const total = participants.length;

  return (
    <div className="standup-page">
      <div className="standup-page__inner">
        <div className="standup-header">
          <h1 className="standup-header__title">{team} Stand Up</h1>
          <button className="duck-btn duck-btn--secondary" onClick={handleShareLinks}>
            Share Links
          </button>
        </div>

        {standUpStatus === 'Ready' && (
          <StartStandUpCard startStandUpHandler={startStandUpHandler} />
        )}
        {standUpStatus === 'In Progress' && (
          <ParticipantCard
            attendee={standUpParticipants[0]}
            passDuckHandler={passDuckHandler}
            lateParticipantHandler={lateParticipantHandler}
            remaining={remaining}
            total={total}
          />
        )}
        {standUpStatus === 'Complete' && (
          <StandUpCompleteCard resetStandUpHandler={resetStandUpHandler} />
        )}

        <ShareLinksModal
          open={shareLinksOpen}
          onClose={() => setShareLinksOpen(false)}
          participants={participantsWithTokens}
        />
      </div>
    </div>
  );
}

const initialiseParticipants = (participants) => {
  const toAdd = [...participants];
  const result = [];
  while (toAdd.length > 0) {
    const [picked] = toAdd.splice(Math.floor(Math.random() * toAdd.length), 1);
    result.push(picked);
  }
  return result;
};
