import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from './firebase';

export async function getImageUrl(imageName){
    const storageRef = ref(storage, `images/${imageName}`);
    let imageUrl;

    await getDownloadURL(storageRef)
        .then((url) => {
            console.log('Image URL: ',url);
            imageUrl = url;
        })
        .catch((error) => {
            console.error('Error getting image URL', error);
        });
    return imageUrl;
}
