import useInput from '../../hooks/use-input';

export default function AddTeam({ addTeam }) {
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
    <div className="add-team-card">
      <p className="add-team-card__title">New team</p>

      <div className="add-team-field">
        <label htmlFor="teamName" className="add-team-label">
          Team Name
        </label>
        <input
          id="teamName"
          type="text"
          placeholder="Team name"
          value={enteredName}
          onChange={nameChangeHandler}
          onBlur={nameInputBlurHandler}
          className="add-team-input"
        />
      </div>

      <button
        className="add-team-submit"
        onClick={addTeamHandler}
        disabled={!enteredNameIsValid}
        type="button"
      >
        Add Team
      </button>
    </div>
  );
}
