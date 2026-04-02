import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

export default function ShareLinksModal({ open, onClose, participants }) {
    const [copied, setCopied] = useState(false);

    const getLink = (token) => `${window.location.origin}/join/${token}`;

    const handleCopyAll = async () => {
        const lines = participants
            .filter(p => p.inviteToken)
            .map(p => `${p.name} — ${getLink(p.inviteToken)}`);
        const text = `Stand-up links for today's session:\n\n${lines.join('\n')}`;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ pr: 6 }}>
                Share Links
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <List dense>
                    {participants.map(p => (
                        <ListItem key={p.id} disableGutters>
                            <ListItemText
                                primary={p.name}
                                secondary={p.inviteToken ? getLink(p.inviteToken) : 'No link yet'}
                                secondaryTypographyProps={{ sx: { wordBreak: 'break-all', fontSize: '0.75rem' } }}
                            />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Close</Button>
                <Button onClick={handleCopyAll} variant="contained" disableElevation>
                    {copied ? 'Copied!' : 'Copy all'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
