import React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import DeleteIcon from '@mui/icons-material/Delete';

export default function StandUpCard(props) {

    const Demo = styled('div')(({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
    }));

    return (
        <Grid item xs={12} md={6}>
            <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
                {props.standUpName}
            </Typography>
            <Demo>
                <List>
                    {props.attendees.map((attendee) => {
                    return <ListItem
                    key={attendee}
                    secondaryAction={
                        <IconButton edge="end" aria-label="delete">
                            <DeleteIcon />
                        </IconButton>
                    }
                >
                    <ListItemText
                        primary={attendee}
                    />
                </ListItem>
                    })}

                </List>
            </Demo>
        </Grid>
    )
}