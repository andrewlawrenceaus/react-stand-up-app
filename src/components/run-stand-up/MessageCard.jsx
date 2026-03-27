import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import messageDuck from '../../assets/message-duck.jpg';
import { Grid } from '@mui/material';

export default function MessageCard(props) {
  const { title, message } = props;

  return (
    <Grid container sx={{ mt: 10 }}>
      <Grid item xs={12} align="center">
        <Card sx={{ maxWidth: 350 }}>
          <CardMedia
            sx={{ height: 500, objectFit: 'contain' }}
            image={messageDuck}
            title="message duck"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {title}
            </Typography>
            <Typography gutterBottom variant="p" component="div">
              {message}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}