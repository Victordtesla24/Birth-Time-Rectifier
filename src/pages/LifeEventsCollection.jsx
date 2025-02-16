import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { formatDate } from '../utils/formatters';

const EVENT_TYPES = {
    CAREER: 'career',
    RELATIONSHIP: 'relationship',
    HEALTH: 'health',
    EDUCATION: 'education',
    RESIDENCE: 'residence',
    SPIRITUAL: 'spiritual',
    OTHER: 'other'
};

const EVENT_TYPE_LABELS = {
    [EVENT_TYPES.CAREER]: 'Career',
    [EVENT_TYPES.RELATIONSHIP]: 'Relationship',
    [EVENT_TYPES.HEALTH]: 'Health',
    [EVENT_TYPES.EDUCATION]: 'Education',
    [EVENT_TYPES.RESIDENCE]: 'Residence',
    [EVENT_TYPES.SPIRITUAL]: 'Spiritual',
    [EVENT_TYPES.OTHER]: 'Other'
};

export const LifeEventsCollectionPage = ({
    onEventsSubmit,
    onBack,
    initialEvents = []
}) => {
    const [events, setEvents] = useState(initialEvents);
    const [currentEvent, setCurrentEvent] = useState({
        type: EVENT_TYPES.CAREER,
        date: '',
        description: '',
        impact: 'medium',
        timeAccuracy: 'approximate'
    });
    const [error, setError] = useState(null);

    const handleEventSubmit = (e) => {
        e.preventDefault();
        setError(null);

        if (!currentEvent.date || !currentEvent.description) {
            setError('Please fill in all required fields');
            return;
        }

        setEvents(prev => [...prev, { ...currentEvent, id: Date.now() }]);
        setCurrentEvent({
            type: EVENT_TYPES.CAREER,
            date: '',
            description: '',
            impact: 'medium',
            timeAccuracy: 'approximate'
        });
    };

    const handleEventDelete = (eventId) => {
        setEvents(prev => prev.filter(event => event.id !== eventId));
    };

    const handleSubmitAll = () => {
        if (events.length === 0) {
            setError('Please add at least one life event');
            return;
        }
        onEventsSubmit(events);
    };

    const renderEventForm = () => (
        <form onSubmit={handleEventSubmit} className="event-form">
            <div className="form-group">
                <label htmlFor="event-type">Event Type</label>
                <select
                    id="event-type"
                    value={currentEvent.type}
                    onChange={e => setCurrentEvent(prev => ({
                        ...prev,
                        type: e.target.value
                    }))}
                >
                    {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="event-date">Date</label>
                <input
                    type="date"
                    id="event-date"
                    value={currentEvent.date}
                    onChange={e => setCurrentEvent(prev => ({
                        ...prev,
                        date: e.target.value
                    }))}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="event-description">Description</label>
                <textarea
                    id="event-description"
                    value={currentEvent.description}
                    onChange={e => setCurrentEvent(prev => ({
                        ...prev,
                        description: e.target.value
                    }))}
                    placeholder="Describe the significant life event..."
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="event-impact">Impact Level</label>
                <select
                    id="event-impact"
                    value={currentEvent.impact}
                    onChange={e => setCurrentEvent(prev => ({
                        ...prev,
                        impact: e.target.value
                    }))}
                >
                    <option value="low">Low Impact</option>
                    <option value="medium">Medium Impact</option>
                    <option value="high">High Impact</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="time-accuracy">Time Accuracy</label>
                <select
                    id="time-accuracy"
                    value={currentEvent.timeAccuracy}
                    onChange={e => setCurrentEvent(prev => ({
                        ...prev,
                        timeAccuracy: e.target.value
                    }))}
                >
                    <option value="exact">Exact</option>
                    <option value="approximate">Approximate</option>
                    <option value="uncertain">Uncertain</option>
                </select>
            </div>

            <button type="submit" className="add-event-button">
                Add Event
            </button>
        </form>
    );

    const renderEventsList = () => (
        <div className="events-list">
            <h3>Added Events</h3>
            {events.length === 0 ? (
                <p className="no-events">No events added yet</p>
            ) : (
                <ul>
                    {events.map(event => (
                        <li key={event.id} className="event-item">
                            <div className="event-header">
                                <span className="event-type">
                                    {EVENT_TYPE_LABELS[event.type]}
                                </span>
                                <span className="event-date">
                                    {formatDate(event.date)}
                                </span>
                            </div>
                            <div className="event-description">
                                {event.description}
                            </div>
                            <div className="event-details">
                                <span className="impact-level">
                                    Impact: {event.impact}
                                </span>
                                <span className="time-accuracy">
                                    Accuracy: {event.timeAccuracy}
                                </span>
                            </div>
                            <button
                                className="delete-event"
                                onClick={() => handleEventDelete(event.id)}
                                aria-label="Delete event"
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    return (
        <div className="life-events-page">
            <header className="page-header">
                <h2>Life Events Collection</h2>
                <p className="header-description">
                    Add significant life events to help improve birth time rectification accuracy.
                </p>
            </header>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="content-container">
                <div className="form-section">
                    {renderEventForm()}
                </div>

                <div className="events-section">
                    {renderEventsList()}
                </div>
            </div>

            <div className="action-buttons">
                <button 
                    className="secondary-button"
                    onClick={onBack}
                >
                    Back
                </button>
                <button 
                    className="primary-button"
                    onClick={handleSubmitAll}
                    disabled={events.length === 0}
                >
                    Continue to Analysis
                </button>
            </div>
        </div>
    );
};

LifeEventsCollectionPage.propTypes = {
    onEventsSubmit: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    initialEvents: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        type: PropTypes.oneOf(Object.values(EVENT_TYPES)),
        date: PropTypes.string,
        description: PropTypes.string,
        impact: PropTypes.oneOf(['low', 'medium', 'high']),
        timeAccuracy: PropTypes.oneOf(['exact', 'approximate', 'uncertain'])
    }))
}; 