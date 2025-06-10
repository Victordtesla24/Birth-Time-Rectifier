import React, { useState } from 'react';
import { Card, Row, Col, Table, Button, Alert } from 'react-bootstrap';
import VedicChartVisualization from '../VedicChartVisualization';
import DivisionalChartsVisualization from '../DivisionalChartsVisualization';

const FinalResultsStep = ({ analysisData, onComplete }) => {
    const [showDivisionalCharts, setShowDivisionalCharts] = useState(false);

    if (!analysisData?.rectification_results) {
        return (
            <Alert variant="warning">
                No rectification results available. Please try again.
            </Alert>
        );
    }

    const {
        original_time,
        rectified_time,
        confidence,
        adjustment_minutes,
        analysis
    } = analysisData.rectification_results;

    return (
        <div className="final-results">
            <h3 className="text-center mb-4">Birth Time Rectification Results</h3>

            <Row className="mb-4">
                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h4>Original Birth Chart</h4>
                            <p className="text-muted mb-0">Time: {original_time}</p>
                        </Card.Header>
                        <Card.Body>
                            <VedicChartVisualization
                                chartData={{
                                    planets: analysisData.original_positions,
                                    birthData: analysisData.birth_details
                                }}
                                isRectified={false}
                            />
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h4>Rectified Birth Chart</h4>
                            <p className="text-muted mb-0">Time: {rectified_time}</p>
                        </Card.Header>
                        <Card.Body>
                            <VedicChartVisualization
                                chartData={{
                                    planets: analysisData.rectified_positions,
                                    birthData: {
                                        ...analysisData.birth_details,
                                        time: rectified_time
                                    }
                                }}
                                isRectified={true}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Header>
                            <h4>Rectification Details</h4>
                        </Card.Header>
                        <Card.Body>
                            <Table striped bordered>
                                <tbody>
                                    <tr>
                                        <th>Original Time</th>
                                        <td>{original_time}</td>
                                    </tr>
                                    <tr>
                                        <th>Rectified Time</th>
                                        <td>{rectified_time}</td>
                                    </tr>
                                    <tr>
                                        <th>Time Adjustment</th>
                                        <td>{adjustment_minutes} minutes</td>
                                    </tr>
                                    <tr>
                                        <th>Confidence Score</th>
                                        <td>{Math.round(confidence * 100)}%</td>
                                    </tr>
                                </tbody>
                            </Table>

                            <h5 className="mt-4">Key Changes</h5>
                            <ul className="key-changes">
                                {analysis.key_changes.map((change, index) => (
                                    <li key={index}>{change}</li>
                                ))}
                            </ul>

                            <h5 className="mt-4">Verification Points</h5>
                            <ul className="verification-points">
                                {analysis.verification_points.map((point, index) => (
                                    <li key={index}>{point}</li>
                                ))}
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <div className="text-center mb-4">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setShowDivisionalCharts(true)}
                >
                    View Divisional Charts
                </Button>
            </div>

            {showDivisionalCharts && (
                <Card className="mb-4">
                    <Card.Header>
                        <h4>Divisional Charts Analysis</h4>
                    </Card.Header>
                    <Card.Body>
                        <DivisionalChartsVisualization
                            divisionalCharts={analysisData.divisional_charts}
                        />
                    </Card.Body>
                </Card>
            )}

            <div className="text-center mt-4">
                <Button
                    variant="success"
                    size="lg"
                    onClick={() => onComplete(analysisData)}
                >
                    Complete Rectification
                </Button>
            </div>
        </div>
    );
};

export default FinalResultsStep; 