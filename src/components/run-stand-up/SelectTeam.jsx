import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

export default function SelectTeam({ teams }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTeam = searchParams.get('team');
  const initialSelectValue = initialTeam ?? '';

  const teamChangeHandler = (event) => {
    setSearchParams({ team: `${event.target.value}` });
  };

  return (
    <div className="standup-selector">
      <FormControl margin="normal" sx={{ minWidth: 160 }}>
        <InputLabel id="team-select-label">Select Team</InputLabel>
        <Select
          labelId="team-select-label"
          id="team-select"
          value={initialSelectValue}
          label="Select Team"
          onChange={teamChangeHandler}
          size="small"
        >
          {teams.map((team) => (
            <MenuItem key={team} value={team}>
              {team}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
