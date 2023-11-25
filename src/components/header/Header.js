import { React, useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import { AuthContext } from '../store/AuthProvider';

export default function Header() {
  const navigate = useNavigate();
  const authCtx = useContext(AuthContext);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  }


  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Stand-Up
          </Typography>
          <Box sx={{ flexGrow: 1, display: 'flex' }}>
            <Button
              component={NavLink}
              to={'manage-teams'}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Manage Teams
            </Button>
            <Button
              component={NavLink}
              to={'/'}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Run Stand-Up
            </Button>
            <Button
              component={NavLink}
              to={'auth?mode=login'}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Authentication
            </Button>
            {authCtx.user && <Button
              sx={{ my: 2, color: 'white', display: 'block' }}
              onClick={handleLogout}
            >
              Log Out
            </Button>}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
