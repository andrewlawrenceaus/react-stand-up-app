import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useInput from '../../hooks/use-input';
import { uploadParticipantPhoto } from '../../utils/db-utils';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

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
    <Box
      sx={{
        width: '100%',
        maxWidth: 400,
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
        Add New Participant
      </Typography>
      <Divider />
      <div>
        <div>
          <TextField
            id="participantName"
            label="Name"
            variant="outlined"
            color="primary"
            focused
            onChange={nameChangeHandler}
            value={enteredName}
            onBlur={nameInputBlurHandler}
            error={nameInputHasError}
            helperText={nameInputHasError ? 'Name must not be empty.' : ''}
            sx={{ m: 1 }}
          />
        </div>
        <div>
          <Button
            component="label"
            variant="outlined"
            sx={{ m: 1 }}
          >
            Upload Photo
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={fileChangeHandler}
            />
          </Button>
          {selectedFile && (
            <Typography component="span" sx={{ ml: 1 }}>
              {selectedFile.name}
            </Typography>
          )}
          {fileSizeError && (
            <Typography color="error" variant="body2" sx={{ ml: 1 }}>
              File must be 5 MB or less.
            </Typography>
          )}
        </div>
        <Divider />
        <div>
          <Button
            variant="outlined"
            onClick={addParticipantHandler}
            disabled={isUploading || !enteredNameIsValid}
            sx={{ m: 1 }}
          >
            {isUploading ? 'Uploading...' : 'Add Participant'}
          </Button>
        </div>
      </div>
    </Box>
  );
}
