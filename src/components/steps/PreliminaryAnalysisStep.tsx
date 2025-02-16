import React from 'react';
import { Card, Row, Col, Table, Badge, Spinner } from 'react-bootstrap';
import { Chart } from 'react-google-charts';
import VedicChartVisualization from '../VedicChartVisualization';

const PreliminaryAnalysisStep = ({ analysisData, onNext }) => {
    if (!analysisData) {
        return (
            <div className="text-center p-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3">Calculating planetary positions and generating birth chart...</p>
            </div>
        );
    }

    const { 
        planetary_positions,
        dasha_periods,
        kp_analysis,
        tattwa_analysis 
    } = analysisData;

    return (
        <div className="preliminary-analysis">
            <Row>
                <Col md={7}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h4>Birth Chart</h4>
                        </Card.Header>
                        <Card.Body>
                            <VedicChartVisualization 
                                chartData={{
                                    planets: planetary_positions,
                                    birthData: analysisData.birth_details
                                }}
                                isRectified={false}
                            />
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={5}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h4>Planetary Positions</h4>
                        </Card.Header>
                        <Card.Body>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Planet</th>
                                        <th>House</th>
                                        <th>Degree</th>
                                        <th>Motion</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(planetary_positions).map(([planet, data]) => (
                                        <tr key={planet}>
                                            <td>{planet}</td>
                                            <td>{data.house}</td>
                                            <td>{Math.round(data.longitude)}°</td>
                                            <td>
                                                <Badge bg={data.speed > 0 ? "success" : "warning"}>
                                                    {data.speed > 0 ? "Direct" : "Retrograde"}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Header>
                            <h4>Current Dasha Periods</h4>
                        </Card.Header>
                        <Card.Body>
                            <div className="dasha-info">
                                <h5>Major Period (Mahadasha)</h5>
                                <p>
                                    {dasha_periods.current_dasha.planet} - 
                                    From {dasha_periods.current_dasha.start_date} 
                                    to {dasha_periods.current_dasha.end_date}
                                </p>
                                
                                <h5>Sub-Period (Bhukti)</h5>
                                <p>
                                    {dasha_periods.current_bhukti.planet} - 
                                    From {dasha_periods.current_bhukti.start_date} 
                                    to {dasha_periods.current_bhukti.end_date}
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h4>KP Analysis</h4>
                        </Card.Header>
                        <Card.Body>
                            <h5>House Significators</h5>
                            {Object.entries(kp_analysis.significators).map(([house, planets]) => (
                                <div key={house} className="mb-2">
                                    <strong>House {house.replace('house', '')}: </strong>
                                    {planets.join(', ')}
                                </div>
                            ))}
                            
                            <h5 className="mt-4">Important Sublords</h5>
                            <div>
                                <strong>Ascendant: </strong>{kp_analysis.sublords.ascendant}
                            </div>
                            <div>
                                <strong>Midheaven: </strong>{kp_analysis.sublords.mc}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h4>Elemental Balance</h4>
                        </Card.Header>
                        <Card.Body>
                            <Chart
                                width={'100%'}
                                height={'200px'}
                                chartType="PieChart"
                                loader={<div>Loading Chart...</div>}
                                data={[
                                    ['Element', 'Percentage'],
                                    ['Fire', tattwa_analysis.elements.fire * 100],
                                    ['Earth', tattwa_analysis.elements.earth * 100],
                                    ['Air', tattwa_analysis.elements.air * 100],
                                    ['Water', tattwa_analysis.elements.water * 100],
                                ]}
                                options={{
                                    title: 'Elemental Distribution',
                                    pieHole: 0.4,
                                    slices: {
                                        0: { color: 'red' },
                                        1: { color: 'brown' },
                                        2: { color: 'yellow' },
                                        3: { color: 'blue' }
                                    }
                                }}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <div className="text-center mt-4">
                <button 
                    className="btn btn-primary"
                    onClick={onNext}
                >
                    Proceed to Questionnaire
                </button>
            </div>
        </div>
    );
};

export default PreliminaryAnalysisStep; 