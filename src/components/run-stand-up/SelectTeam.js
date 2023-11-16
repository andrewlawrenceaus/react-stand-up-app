import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

export default function SelectTeam(props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTeam = searchParams.get('team');
  const teams = props.teams;
  const initialSelectValue = initialTeam ? initialTeam : teams[0];


  const teamChangeHandler = (event) => {
    setSearchParams({ team: `${event.target.value}` });
  };

  return (
    <FormControl fullWidth={false} margin='normal'>
      <InputLabel id="team-select-label">Active Team</InputLabel>
      <Select
        labelId="team-select-label"
        id="team-select"
        value={initialSelectValue}
        label="Active Team"
        onChange={teamChangeHandler}
      >
        {teams.map((team) => {
          return (
            <MenuItem key={team} value={team}>
              {team}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
