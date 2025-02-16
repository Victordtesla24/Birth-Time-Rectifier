import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider
} from '@mui/material';

const DataConsolidation = ({ birthData, researchData, onNext, onBack }) => {
  const handleSubmit = () => {
    onNext();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Data Review & Consolidation
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Birth Information
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Birth Date"
              secondary={birthData.birthDate?.toLocaleDateString()}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Birth Time"
              secondary={birthData.birthTime?.toLocaleTimeString()}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Location"
              secondary={birthData.location}
            />
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Life Events
        </Typography>
        <List>
          {researchData.map((event, index) => (
            <React.Fragment key={event.timestamp.getTime()}>
              <ListItem>
                <ListItemText
                  primary={event.text}
                  secondary={event.timestamp.toLocaleString()}
                />
              </ListItem>
              {index < researchData.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button onClick={onBack}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default DataConsolidation; 