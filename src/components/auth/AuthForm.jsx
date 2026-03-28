import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {
  NavLink,
  Form,
  useActionData,
  useNavigation,
  useSearchParams,
} from 'react-router-dom';

export default function AuthForm() {
  const data = useActionData();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const isLogin = searchParams.get('mode') === 'login';
  const isSubmitting = navigation.state === 'submitting';

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          {isLogin ? 'Log In' : 'Create New User'}
        </Typography>
        <Typography component="p" color='red'>
          {data && data.error && (
            <ul>
              {Object.values(data.errors).map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}
        </Typography>
        <Box
          component={Form}
          method="POST"
          noValidate
          sx={{ mt: 1 }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
          <Grid container>
            <Grid item>
              <Link
                component={NavLink}
                to={`?mode=${isLogin ? 'signup' : 'login'}`}
                variant="body2"
              >
                {isLogin
                  ? "Don't have an account? Sign Up"
                  : 'Already have an account? Log In'}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
