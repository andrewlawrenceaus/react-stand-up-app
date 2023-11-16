import { Button, Divider, TextField } from "@mui/material";
import useInput from "../../hooks/use-input";

export default function AddTeam(props) {

    const addTeamHandler = () => {}


    const {
        value: enteredName,
        isValid: enteredNameIsValid,
        hasError: nameInputHasError,
        valueChangeHandler: nameChangeHandler,
        inputBlurHandler: nameInputBlurHandler,
        reset: resetNameInput,
      } = useInput((value) => value.trim() !== '');

    return (

        <>
            <h1>Add New Team</h1>
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
                ></TextField>
            </div>
            <Divider />
            <div>
                <Button variant="outlined" onClick={addTeamHandler}>
                    Add Team
                </Button>
            </div>
        </>

    )

}