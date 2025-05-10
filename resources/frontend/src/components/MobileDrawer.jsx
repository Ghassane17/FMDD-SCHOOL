import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider
} from '@mui/material';
import { Link } from 'react-router-dom';

export default function MobileDrawer({ open, onClose, items }) {
  return (
    <Drawer open={open} onClose={onClose}>
      <Box sx={{ width: 250 }} role="presentation">
        <List>
          {items.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton component={Link} to={item.path} onClick={onClose}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
      </Box>
    </Drawer>
  );
}