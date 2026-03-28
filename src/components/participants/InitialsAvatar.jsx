import React from 'react';
import Avatar from '@mui/material/Avatar';
import red from '@mui/material/colors/red';
import pink from '@mui/material/colors/pink';
import purple from '@mui/material/colors/purple';
import indigo from '@mui/material/colors/indigo';
import blue from '@mui/material/colors/blue';
import teal from '@mui/material/colors/teal';
import green from '@mui/material/colors/green';
import orange from '@mui/material/colors/orange';

const COLORS = [
  red[500],
  pink[500],
  purple[500],
  indigo[500],
  blue[500],
  teal[500],
  green[500],
  orange[500],
];

function getInitials(name) {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return words[0][0].toUpperCase();
}

function getColor(name) {
  return COLORS[name.charCodeAt(0) % COLORS.length];
}

export default function InitialsAvatar({ name, sx }) {
  const initials = getInitials(name);
  const color = getColor(name);

  return (
    <Avatar sx={{ bgcolor: color, ...sx }}>
      {initials}
    </Avatar>
  );
}
