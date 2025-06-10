import React, { useState, useEffect } from 'react';
import { Card, Form, Button, ProgressBar, Alert } from 'react-bootstrap';

const RectificationStep = ({ birthData, onComplete }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [confidence, setConfidence] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAnswer = async (questionId, answer) => {
        const newAnswers = { ...answers, [questionId]: answer };
        setAnswers(newAnswers);

        try {
            setLoading(true);
            const response = await fetch('/api/rectification/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    birthData,
                    answers: newAnswers
                })
            });

            const result = await response.json();
            setConfidence(result.confidence);

            if (result.confidence >= 95) {
                onComplete(result);
            } else {
                setCurrentQuestion(prev => prev + 1);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderQuestion = (question) => {
        return (
            <Card className="mb-4">
                <Card.Header>
                    <h4>{question.question}</h4>
                    <ProgressBar 
                        now={confidence} 
                        label={`${confidence.toFixed(1)}% Confidence`}
                        variant={confidence >= 95 ? "success" : "info"}
                    />
                </Card.Header>
                <Card.Body>
                    <Form>
                        {question.options.map((option, idx) => (
                            <Form.Check
                                key={idx}
                                type={question.multiple ? "checkbox" : "radio"}
                                id={`option-${idx}`}
                                label={option}
                                name={question.id}
                                onChange={() => handleAnswer(question.id, option)}
                            />
                        ))}
                    </Form>
                </Card.Body>
            </Card>
        );
    };

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (loading) {
        return <div className="text-center">Processing your answer...</div>;
    }

    return (
        <div className="rectification-step">
            <h3 className="text-center mb-4">Birth Time Rectification</h3>
            {currentQuestion < questions.length && renderQuestion(questions[currentQuestion])}
        </div>
    );
};

export default RectificationStep; 