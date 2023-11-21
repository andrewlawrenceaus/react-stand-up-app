import {
  Box,
  Button,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import useInput from '../../hooks/use-input';

export default function AddTeam(props) {
  const addTeam = props.addTeam;

  const {
    value: enteredName,
    isValid: enteredNameIsValid,
    hasError: nameInputHasError,
    valueChangeHandler: nameChangeHandler,
    inputBlurHandler: nameInputBlurHandler,
    reset: resetNameInput,
  } = useInput((value) => value.trim() !== '');

  const addTeamHandler = () => {
    if (enteredNameIsValid && !nameInputHasError) {
      addTeam(enteredName);
      resetNameInput();
    }
  };

  return (
    <Grid item xs={6} align="center">
      <Box
        sx={{
          width: '100%',
          maxWidth: 350,
          border: '1px solid',
          borderRadius: '16px',
          borderColor: 'black',
        }}
      >
        <Typography
          sx={{ mt: 1, mb: 2, textAlign: 'center' }}
          variant="h6"
          component="div"
        >
          Add New Team
        </Typography>
        <Divider />
        <div>
          <div>
            <TextField
              id="teamName"
              label="Team Name"
              variant="outlined"
              color="primary"
              focused
              onChange={nameChangeHandler}
              value={enteredName}
              onBlur={nameInputBlurHandler}
              sx={{ m: 1 }}
            ></TextField>
          </div>
          <Divider />
          <div>
            <Button variant="outlined" onClick={addTeamHandler} sx={{ m: 1 }}>
              Add Team
            </Button>
          </div>
        </div>
      </Box>
    </Grid>
  );
}
