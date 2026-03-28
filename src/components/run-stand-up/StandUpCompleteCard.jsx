import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import finishedDuck from '../../assets/sunset-ducks.jpg';

export default function StandUpCompleteCard(props) {
  return (
    <Card sx={{ maxWidth: 500 }}>
      <CardMedia
        sx={{ height: 500, objectFit: 'contain' }}
        image={finishedDuck}
        title="finished-duck"
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Finished!
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={props.resetStandUpHandler}>
          Reset Stand Up
        </Button>
      </CardActions>
    </Card>
  );
}
