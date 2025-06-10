import React, { useState } from 'react';
import { Card, Row, Col, Form, ProgressBar, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    Checkbox,
    Badge,
    Paper
} from '@mui/material';

const QuestionnaireStep = ({ questionnaire, onAnswer, onNext }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showError, setShowError] = useState(false);

    if (!questionnaire || !questionnaire.questions) {
        return (
            <div className="text-center p-5">
                <Alert variant="info">
                    Loading personalized questions...
                </Alert>
            </div>
        );
    }

    const questions = questionnaire.questions;
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    const handleAnswer = (value) => {
        const newAnswers = {
            ...answers,
            [currentQuestion.id]: {
                value,
                verification_type: currentQuestion.verification_type
            }
        };
        setAnswers(newAnswers);
        onAnswer(currentQuestion.id, value);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handleSubmit = () => {
        if (Object.keys(answers).length < questions.length) {
            setShowError(true);
            return;
        }
        onNext(answers);
    };

    const renderQuestionInput = () => {
        switch (currentQuestion.input_type) {
            case 'select':
                return (
                    <Form.Select 
                        onChange={(e) => handleAnswer(e.target.value)}
                        value={answers[currentQuestion.id]?.value || ''}
                    >
                        <option value="">Select an option</option>
                        {currentQuestion.options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </Form.Select>
                );

            case 'multi_select':
                return (
                    <div>
                        {currentQuestion.options.map(option => (
                            <Form.Check
                                key={option.value}
                                type="checkbox"
                                id={`${currentQuestion.id}-${option.value}`}
                                label={option.label}
                                checked={answers[currentQuestion.id]?.value?.includes(option.value)}
                                onChange={(e) => {
                                    const currentValues = answers[currentQuestion.id]?.value || [];
                                    const newValues = e.target.checked
                                        ? [...currentValues, option.value]
                                        : currentValues.filter(v => v !== option.value);
                                    handleAnswer(newValues);
                                }}
                            />
                        ))}
                    </div>
                );

            case 'checkbox_group':
                return (
                    <div className="checkbox-grid">
                        {currentQuestion.options.map(option => (
                            <Form.Check
                                key={option.value}
                                type="checkbox"
                                id={`${currentQuestion.id}-${option.value}`}
                                label={option.label}
                                checked={answers[currentQuestion.id]?.value?.includes(option.value)}
                                onChange={(e) => {
                                    const currentValues = answers[currentQuestion.id]?.value || [];
                                    const newValues = e.target.checked
                                        ? [...currentValues, option.value]
                                        : currentValues.filter(v => v !== option.value);
                                    handleAnswer(newValues);
                                }}
                            />
                        ))}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="questionnaire-step">
            <Row>
                <Col md={8}>
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="question-card">
                            <Card.Header>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h4>Question {currentQuestionIndex + 1} of {questions.length}</h4>
                                    <Badge bg={currentQuestion.sensitivity === 'high' ? 'danger' : 'info'}>
                                        {currentQuestion.sensitivity} priority
                                    </Badge>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <h5>{currentQuestion.text}</h5>
                                <p className="text-muted">{currentQuestion.context}</p>
                                <Form className="mt-4">
                                    {renderQuestionInput()}
                                </Form>
                            </Card.Body>
                        </Card>
                    </motion.div>

                    {showError && (
                        <Alert variant="warning" className="mt-3">
                            Please answer all questions before proceeding.
                        </Alert>
                    )}

                    <div className="d-flex justify-content-between mt-4">
                        <button
                            className="btn btn-outline-secondary"
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                        >
                            Previous
                        </button>
                        {currentQuestionIndex === questions.length - 1 ? (
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmit}
                            >
                                Submit Answers
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                                disabled={!answers[currentQuestion.id]}
                            >
                                Next Question
                            </button>
                        )}
                    </div>
                </Col>

                <Col md={4}>
                    <Card className="progress-card">
                        <Card.Header>
                            <h4>Progress</h4>
                        </Card.Header>
                        <Card.Body>
                            <ProgressBar 
                                now={progress} 
                                label={`${Math.round(progress)}%`}
                                variant="success"
                            />
                            <div className="mt-4">
                                <h5>Questions Overview</h5>
                                <div className="questions-overview">
                                    {questions.map((q, index) => (
                                        <div
                                            key={q.id}
                                            className={`question-dot ${index === currentQuestionIndex ? 'active' : ''} ${answers[q.id] ? 'answered' : ''}`}
                                            onClick={() => setCurrentQuestionIndex(index)}
                                        >
                                            {index + 1}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="info-card mt-4">
                        <Card.Header>
                            <h4>Why These Questions?</h4>
                        </Card.Header>
                        <Card.Body>
                            <p>These questions are dynamically generated based on:</p>
                            <ul>
                                <li>Your birth chart's planetary positions</li>
                                <li>Current dasha periods</li>
                                <li>Important life events timeframes</li>
                                <li>Critical degrees and sensitive points</li>
                            </ul>
                            <p className="text-muted mt-3">
                                Your answers help us fine-tune the birth time by correlating life events with planetary movements.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

QuestionnaireStep.propTypes = {
    questionnaire: PropTypes.shape({
        questions: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string.isRequired,
            text: PropTypes.string.isRequired,
            input_type: PropTypes.string.isRequired,
            options: PropTypes.arrayOf(PropTypes.string),
            verification_type: PropTypes.string,
            sensitivity: PropTypes.string,
            context: PropTypes.string
        })).isRequired
    }).isRequired,
    onAnswer: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired
};

export default QuestionnaireStep; 