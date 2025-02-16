import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const PreliminaryResearch = ({ birthData, onResearchDataChange, onNext, onBack }) => {
  const [currentEvent, setCurrentEvent] = useState('');
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  const handleEventChange = (event) => {
    setCurrentEvent(event.target.value);
    setError('');
  };

  const handleAddEvent = () => {
    if (!currentEvent.trim()) {
      setError('Please enter an event');
      return;
    }

    const newEvents = [...events, { text: currentEvent.trim(), timestamp: new Date() }];
    setEvents(newEvents);
    onResearchDataChange(newEvents);
    setCurrentEvent('');
  };

  const handleRemoveEvent = (index) => {
    const newEvents = events.filter((_, i) => i !== index);
    setEvents(newEvents);
    onResearchDataChange(newEvents);
  };

  const handleSubmit = () => {
    if (events.length === 0) {
      setError('Please add at least one life event');
      return;
    }
    onNext();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Life Events Research
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          Birth Details:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Date: {birthData.birthDate?.toLocaleDateString()}
          <br />
          Time: {birthData.birthTime?.toLocaleTimeString()}
          <br />
          Location: {birthData.location}
        </Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              id="life-event-input"
              label="Enter a significant life event"
              value={currentEvent}
              onChange={handleEventChange}
              error={!!error}
              fullWidth
              inputProps={{
                'data-testid': 'life-event-input',
                'aria-label': 'enter a significant life event',
                'aria-errormessage': error ? 'life-event-error' : undefined
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddEvent}
              sx={{ minWidth: 100 }}
            >
              Add
            </Button>
          </Box>
          <Typography
            id="life-event-error"
            data-testid="life-event-error"
            color="error"
            role="alert"
            sx={{ 
              visibility: error ? 'visible' : 'hidden',
              minHeight: '1.5em'
            }}
          >
            {error || ' '}
          </Typography>
        </Box>

        <List>
          {events.map((event, index) => (
            <ListItem
              key={event.timestamp.getTime()}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleRemoveEvent(index)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText primary={event.text} />
            </ListItem>
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
          disabled={events.length === 0}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default PreliminaryResearch; 