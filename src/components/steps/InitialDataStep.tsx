import React from 'react';
import { Card, Row, Col, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faMapMarkerAlt, faCalendar, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const InitialDataStep = ({ birthData, onNext }) => {
    const { birthDate, birthTime, location } = birthData;

    return (
        <div className="initial-data-step">
            <Row>
                <Col md={8}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h4>Your Birth Details</h4>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush">
                                <ListGroup.Item>
                                    <FontAwesomeIcon icon={faCalendar} className="me-2" />
                                    <strong>Birth Date:</strong> {birthDate}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <FontAwesomeIcon icon={faClock} className="me-2" />
                                    <strong>Birth Time:</strong> {birthTime}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                    <strong>Location:</strong> {location}
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Header>
                            <h4>Why Accurate Birth Time Matters</h4>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush">
                                <ListGroup.Item>
                                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                                    The Ascendant (Rising Sign) changes every 2 hours
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                                    House cusps shift significantly with time changes
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                                    Planetary positions need precise timing for accuracy
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="info-sidebar">
                        <Card.Header>
                            <h4>What's Next?</h4>
                        </Card.Header>
                        <Card.Body>
                            <p>We will:</p>
                            <ol>
                                <li>Convert your local time to Universal Time</li>
                                <li>Calculate exact coordinates for your birthplace</li>
                                <li>Generate your preliminary birth chart</li>
                                <li>Analyze planetary positions</li>
                                <li>Prepare personalized verification questions</li>
                            </ol>
                            <div className="text-center mt-4">
                                <button 
                                    className="btn btn-primary"
                                    onClick={onNext}
                                >
                                    Begin Analysis
                                </button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default InitialDataStep; 