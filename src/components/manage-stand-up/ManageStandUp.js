import React from 'react';
import Typography from '@mui/material/Typography';
import StandUpCard from './StandUpCard';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';


export default function ManageStandUp(props) {
    console.log(props.standUps)
    const standUpCards = generateStandUpCards(props.standUps);
    return (
        <>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
                Manage Stand Ups
            </Typography>
            <Box sx={{ flexGrow: 1, maxWidth: 752 }}>
                <Grid container spacing={2}>
                    {standUpCards}
                </Grid>
            </Box>
        </>
    )
}

function generateStandUpCards(standUps) {
    let standUpCards = []
    standUps.forEach((attendees, standUpName) => {
        standUpCards.push(<StandUpCard
            key={standUpName}
            standUpName={standUpName}
            attendees={attendees}>
        </StandUpCard>)
    }
    );
    return standUpCards;
}