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
          <Typography variant="h6" component="div" sx={{mr: 2}}>
            Stand-Up Duck
          </Typography>
          <Box sx={{ display: 'flex', flexGrow: 1 }}>
            {authCtx.user && <Button
              component={NavLink}
              to={'manage-teams'}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Manage Teams
            </Button>}
            {authCtx.user && <Button
              component={NavLink}
              to={'/'}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Run Stand-Up
            </Button>}
          </Box>
          <Box sx={{ display: 'flex' }}>
            {!authCtx.user && <Button
              component={NavLink}
              to={'auth?mode=login'}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Login
            </Button>}
            {authCtx.user && <Button
              sx={{ my: 2, color: 'white', display: 'block' }}
              onClick={handleLogout}
            >
              Log Out
            </Button>
            }
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
