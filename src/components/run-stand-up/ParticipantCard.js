import React from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';

import youngDuckling from '../../assets/young-duckling.jpg'
import duckling from '../../assets/duckling.jpg' 
import ducklingWalking from '../../assets/duckling-walking.jpg' 
import adultDuck from '../../assets/adult-duck.jpg'

export default function ParticipantCard(props) {

  const duckImage = setDuckImage(1 - props.percentageComplete);

  return (
    <Card>
      <CardMedia
        sx={{ height: 500, objectFit: 'contain' }}
        image={duckImage}
        title="duck"
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {props.attendee}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={props.passDuckHandler}>Pass the Duck</Button>
        <Button size="small" onClick={props.lateParticipantHandler}>Not Ready</Button>
      </CardActions>
    </Card>
  )

}

function setDuckImage(percentageComplete){
  console.log(percentageComplete);
  if (percentageComplete <= 0.25){
    return youngDuckling;
  }
  else if (percentageComplete <= 0.5){
    return duckling;
  }
  else if (percentageComplete <= 0.75){
    return ducklingWalking;
  }
  else return adultDuck;
}