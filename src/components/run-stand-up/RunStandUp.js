import { React, useState } from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';

export default function RunStandUp(props) {
    const [standUpAttendees, setStandUpAttendees] = useState(initialiseStandUpAttendees(props.standUp));
    
    const passDuckHandler = () => {
        let updatedAttendees = standUpAttendees.slice();
        updatedAttendees.splice(0,1);
        setStandUpAttendees(updatedAttendees);
    }
    const lateAttendeeHandler = () => {
        let updatedAttendees = standUpAttendees.slice();
        let lateAttendee = updatedAttendees.splice(0, 1);
        updatedAttendees.push(...lateAttendee);
        setStandUpAttendees(updatedAttendees);
    }

    return (
        <>
    <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
            Run {props.activeStandUp} Stand Up
    </Typography>

        <Card sx={{ maxWidth: 345 }}>
          <CardMedia
            sx={{ height: 140, objectFit: 'contain' }}
            image="https://www.shutterstock.com/image-photo/mallard-duck-clipping-path-colourful-600w-1384212383.jpg"
            title="duck"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {standUpAttendees[0]}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" onClick={passDuckHandler}>Pass the Duck</Button>
            <Button size="small" onClick={lateAttendeeHandler}>Not Ready</Button>
          </CardActions>
        </Card>
        </>

    )
}

const initialiseStandUpAttendees = (attendees) => {
    let standUpSessionAttendees = [];
    let attendeesToAdd = [...attendees];
    while (attendeesToAdd.length > 0) {
      let randomAttendee = attendeesToAdd
        .splice(Math.floor(Math.random() * attendeesToAdd.length), 1)
        standUpSessionAttendees.push(...randomAttendee);
    }
    return standUpSessionAttendees;
  }