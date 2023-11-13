import { React, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { NavLink } from 'react-router-dom';

export default function Header() {
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
              to={'/'}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Manage Stand-Ups
            </Button>
            <Button
              component={NavLink}
              to={'stand-up'}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Run Stand-Up
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
