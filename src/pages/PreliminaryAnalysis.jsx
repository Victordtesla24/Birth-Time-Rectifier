import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChartVisualization } from '../components/ChartVisualization';
import { formatTime } from '../utils/formatters';

export const PreliminaryAnalysisPage = ({
    birthData,
    onAnalysisComplete,
    onBack
}) => {
    const [analysisStatus, setAnalysisStatus] = useState('initializing');
    const [analysisResults, setAnalysisResults] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const runAnalysis = async () => {
            try {
                setAnalysisStatus('analyzing');
                
                // Step 1: Calculate planetary positions
                setAnalysisStatus('calculating_positions');
                const positions = await calculatePlanetaryPositions(birthData);
                
                // Step 2: Generate initial chart
                setAnalysisStatus('generating_chart');
                const initialChart = await generateBirthChart(positions);
                
                // Step 3: Analyze sensitive points
                setAnalysisStatus('analyzing_sensitivity');
                const sensitivityAnalysis = await analyzeSensitivePoints(positions);
                
                // Step 4: Generate preliminary recommendations
                setAnalysisStatus('generating_recommendations');
                const recommendations = generateRecommendations(
                    sensitivityAnalysis,
                    positions
                );
                
                // Compile results
                const results = {
                    birth_data: birthData,
                    planetary_positions: positions,
                    birth_chart: initialChart,
                    sensitivity_analysis: sensitivityAnalysis,
                    recommendations,
                    timestamp: new Date().toISOString()
                };
                
                setAnalysisResults(results);
                setAnalysisStatus('complete');
                
            } catch (err) {
                console.error('Analysis error:', err);
                setError(err.message || 'Failed to complete analysis');
                setAnalysisStatus('error');
            }
        };

        runAnalysis();
    }, [birthData]);

    const renderStatusMessage = () => {
        const messages = {
            initializing: 'Initializing analysis...',
            analyzing: 'Analyzing birth data...',
            calculating_positions: 'Calculating planetary positions...',
            generating_chart: 'Generating birth chart...',
            analyzing_sensitivity: 'Analyzing sensitive points...',
            generating_recommendations: 'Generating recommendations...',
            complete: 'Analysis complete',
            error: 'Analysis failed'
        };

        return (
            <div className="status-message">
                <div className="status-text">
                    {messages[analysisStatus]}
                </div>
                {analysisStatus !== 'complete' && analysisStatus !== 'error' && (
                    <div className="progress-indicator" />
                )}
            </div>
        );
    };

    const renderAnalysisResults = () => {
        if (!analysisResults) return null;

        const {
            birth_chart,
            sensitivity_analysis,
            recommendations
        } = analysisResults;

        return (
            <div className="analysis-results">
                <div className="chart-section">
                    <h3>Birth Chart Analysis</h3>
                    <ChartVisualization
                        chartType="vedic"
                        containerId="preliminary-chart"
                        chartData={birth_chart}
                        options={{
                            width: 500,
                            height: 500,
                            style: 'north-indian',
                            showDegrees: true
                        }}
                    />
                </div>

                <div className="sensitivity-section">
                    <h3>Time Sensitivity Analysis</h3>
                    <div className="sensitivity-factors">
                        {sensitivity_analysis.factors.map(factor => (
                            <div key={factor.name} className="sensitivity-factor">
                                <span className="factor-name">{factor.name}:</span>
                                <span className="factor-value">
                                    {factor.sensitivity_level}
                                </span>
                                <div className="factor-description">
                                    {factor.description}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="recommendations-section">
                    <h3>Recommendations</h3>
                    <ul className="recommendations-list">
                        {recommendations.map((rec, index) => (
                            <li key={index} className="recommendation-item">
                                <div className="recommendation-priority">
                                    Priority: {rec.priority}
                                </div>
                                <div className="recommendation-text">
                                    {rec.text}
                                </div>
                                {rec.explanation && (
                                    <div className="recommendation-explanation">
                                        {rec.explanation}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    return (
        <div className="preliminary-analysis-page">
            <header className="page-header">
                <h2>Preliminary Analysis</h2>
                <div className="birth-info">
                    <div>Date: {birthData.date}</div>
                    <div>Time: {formatTime(birthData.time)}</div>
                    <div>Location: {birthData.location}</div>
                </div>
            </header>

            {renderStatusMessage()}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {renderAnalysisResults()}

            <div className="action-buttons">
                <button 
                    className="secondary-button"
                    onClick={onBack}
                    disabled={analysisStatus === 'analyzing'}
                >
                    Back
                </button>
                {analysisResults && (
                    <button 
                        className="primary-button"
                        onClick={() => onAnalysisComplete(analysisResults)}
                    >
                        Continue to Questionnaire
                    </button>
                )}
            </div>
        </div>
    );
};

PreliminaryAnalysisPage.propTypes = {
    birthData: PropTypes.shape({
        date: PropTypes.string.isRequired,
        time: PropTypes.string.isRequired,
        location: PropTypes.string.isRequired
    }).isRequired,
    onAnalysisComplete: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired
}; 