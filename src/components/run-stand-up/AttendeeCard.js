import React from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import duck from '../../assets/duck.jpg'

export default function AttendeeCard(props){

    return (
        <Card sx={{ maxWidth: 345 }}>
        <CardMedia
          sx={{ height: 300, objectFit: 'contain' }}
          image={duck}
          title="duck"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {props.attendee}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" onClick={props.passDuckHandler}>Pass the Duck</Button>
          <Button size="small" onClick={props.lateAttendeeHandler}>Not Ready</Button>
        </CardActions>
      </Card>
    )

}