import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

export default function SelectStandUp(props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTeam = searchParams.get('team');
  const initialSelectValue = initialTeam ? initialTeam : '';
  const teams = props.teams;

  const standUpChangeHandler = (event) => {
    setSearchParams({team: `${event.target.value}` });
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="stand-up-select-label">Active Stand Up</InputLabel>
      <Select
        labelId="stand-up-select-label"
        id="stand-up-select"
        value={initialSelectValue}
        label="Active Stand Up"
        onChange={standUpChangeHandler}
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
