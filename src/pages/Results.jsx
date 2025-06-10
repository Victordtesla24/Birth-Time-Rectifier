import React from 'react';
import PropTypes from 'prop-types';
import { ChartVisualization } from '../components/ChartVisualization';
import { formatTime, calculateConfidenceColor } from '../utils/formatters';

export const ResultsPage = ({ 
    analysisResults,
    onBackClick,
    onNewAnalysis 
}) => {
    const {
        original_time,
        rectified_time,
        confidence_score,
        adjustment_details
    } = analysisResults;

    return (
        <div className="results-page">
            <header className="results-header">
                <h2>Birth Time Rectification Results</h2>
                <div className="confidence-indicator">
                    <span>Confidence Score:</span>
                    <span 
                        className="score" 
                        style={{ color: calculateConfidenceColor(confidence_score) }}
                    >
                        {confidence_score}%
                    </span>
                </div>
            </header>

            <div className="time-comparison">
                <div className="time-block original">
                    <h3>Original Birth Time</h3>
                    <div className="time">{formatTime(original_time)}</div>
                </div>
                <div className="time-block rectified">
                    <h3>Rectified Birth Time</h3>
                    <div className="time">{formatTime(rectified_time)}</div>
                    <div className="adjustment">
                        Adjustment: {adjustment_details.minutes_adjusted} minutes
                    </div>
                </div>
            </div>

            <div className="charts-section">
                <div className="chart-container">
                    <h3>Original Birth Chart</h3>
                    <ChartVisualization
                        chartType="vedic"
                        containerId="original-chart"
                        chartData={analysisResults.original_chart}
                        options={{
                            width: 400,
                            height: 400,
                            style: 'north-indian'
                        }}
                    />
                </div>
                <div className="chart-container">
                    <h3>Rectified Birth Chart</h3>
                    <ChartVisualization
                        chartType="vedic"
                        containerId="rectified-chart"
                        chartData={analysisResults.rectified_chart}
                        options={{
                            width: 400,
                            height: 400,
                            style: 'north-indian'
                        }}
                    />
                </div>
            </div>

            <div className="analysis-details">
                <h3>Rectification Analysis</h3>
                <div className="confidence-factors">
                    <h4>Confidence Factors</h4>
                    <ul>
                        {Object.entries(adjustment_details.confidence_factors).map(([factor, value]) => (
                            <li key={factor}>
                                <span className="factor-name">
                                    {factor.replace(/_/g, ' ').toUpperCase()}:
                                </span>
                                <span className="factor-value">
                                    {(value * 100).toFixed(1)}%
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="verification-points">
                    <h4>Verification Points</h4>
                    <ul>
                        {adjustment_details.verification_points.map((point, index) => (
                            <li key={index}>
                                <span className="point-type">
                                    {point.type}:
                                </span>
                                <span className="point-detail">
                                    {point.planet} ({(point.confidence * 100).toFixed(1)}% confidence)
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="action-buttons">
                <button 
                    className="secondary-button"
                    onClick={onBackClick}
                >
                    Back to Analysis
                </button>
                <button 
                    className="primary-button"
                    onClick={onNewAnalysis}
                >
                    Start New Analysis
                </button>
            </div>
        </div>
    );
};

ResultsPage.propTypes = {
    analysisResults: PropTypes.shape({
        original_time: PropTypes.string.isRequired,
        rectified_time: PropTypes.string.isRequired,
        confidence_score: PropTypes.number.isRequired,
        adjustment_details: PropTypes.shape({
            minutes_adjusted: PropTypes.number.isRequired,
            confidence_factors: PropTypes.object.isRequired,
            verification_points: PropTypes.arrayOf(PropTypes.shape({
                type: PropTypes.string,
                planet: PropTypes.string,
                confidence: PropTypes.number
            })).isRequired
        }).isRequired,
        original_chart: PropTypes.object.isRequired,
        rectified_chart: PropTypes.object.isRequired
    }).isRequired,
    onBackClick: PropTypes.func.isRequired,
    onNewAnalysis: PropTypes.func.isRequired
}; 