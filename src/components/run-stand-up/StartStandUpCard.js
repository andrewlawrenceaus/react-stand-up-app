import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import { getImageUrl } from '../../utils/storage-utils';

export default function StartStandUpCard(props) {
  const [duckUrl, setDuckUrl] = useState(null);

  useEffect(() => {
    const fetchDuckUrl = async () => {
      const url = await getImageUrl('duck-eggs.jpg');
      setDuckUrl(url);
    }
    fetchDuckUrl();
  }, []);

  return (
    <Card sx={{ maxWidth: 350 }}>
      {duckUrl &&
      <CardMedia
        sx={{ height: 500, objectFit: 'contain' }}
        image={duckUrl}
        title="start duck"
      />
      }
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Start Stand Up
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={props.startStandUpHandler}>
          Start Stand Up
        </Button>
      </CardActions>
    </Card>
  );
}
