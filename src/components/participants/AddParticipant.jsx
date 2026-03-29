import { useRef, useState } from 'react';
import useInput from '../../hooks/use-input';
import { uploadParticipantPhoto } from '../../utils/db-utils';
import { MAX_FILE_SIZE } from './constants';

export default function AddParticipant({ onAdd }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(false);
  const fileInputRef = useRef(null);

  const {
    value: enteredName,
    isValid: enteredNameIsValid,
    hasError: nameInputHasError,
    valueChangeHandler: nameChangeHandler,
    inputBlurHandler: nameInputBlurHandler,
    reset: resetNameInput,
  } = useInput((value) => value.trim() !== '');

  const fileChangeHandler = (event) => {
    const file = event.target.files[0] || null;
    if (file && file.size > MAX_FILE_SIZE) {
      setFileSizeError(true);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setFileSizeError(false);
      setSelectedFile(file);
    }
  };

  const addParticipantHandler = async () => {
    if (!enteredNameIsValid) return;

    const id = crypto.randomUUID();
    let photoUrl = '';

    if (selectedFile) {
      setIsUploading(true);
      try {
        photoUrl = await uploadParticipantPhoto(id, selectedFile);
      } finally {
        setIsUploading(false);
      }
    }

    onAdd({ id, name: enteredName.trim(), photoUrl });
    resetNameInput();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="add-form-card">
      <p className="add-form-card__title">New flock member</p>

      <div className="add-form-field">
        <label htmlFor="participantName" className="add-form-label">
          Name
        </label>
        <input
          id="participantName"
          type="text"
          placeholder="Full name"
          value={enteredName}
          onChange={nameChangeHandler}
          onBlur={nameInputBlurHandler}
          className={
            nameInputHasError
              ? 'add-form-input add-form-input--error'
              : 'add-form-input'
          }
        />
        {nameInputHasError && (
          <span className="add-form-error">Name must not be empty.</span>
        )}
      </div>

      <div className="add-form-actions">
        <label className="add-form-upload-btn">
          {selectedFile ? '↺ Change photo' : '+ Photo'}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={fileChangeHandler}
          />
        </label>

        {selectedFile && (
          <span className="add-form-filename">{selectedFile.name}</span>
        )}
        {fileSizeError && (
          <span className="add-form-size-error">Max 5 MB.</span>
        )}

        <button
          className="add-form-submit"
          onClick={addParticipantHandler}
          disabled={isUploading || !enteredNameIsValid}
          type="button"
        >
          {isUploading ? 'Uploading…' : 'Add Participant'}
        </button>
      </div>
    </div>
  );
}
