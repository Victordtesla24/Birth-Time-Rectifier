const express = require('express');
const router = express.Router();
const { RectificationController } = require('../../js/modules/rectification_controller');
const { validateBirthData, validateLifeEvents, validateQuestionnaireResponse } = require('../../middleware/validation');
const { NextApiRequest, NextApiResponse } = require('next');
const { spawn } = require('child_process');
const path = require('path');

// Initialize rectification process
router.post('/start', validateBirthData, async (req, res) => {
    try {
        const { birth_date, birth_time, birth_place } = req.body;
        
        // Get initial data from Agent 1
        const initialData = await collectInitialData(birth_date, birth_time, birth_place);
        
        // Initialize rectification process
        const controller = new RectificationController(initialData);
        const result = await controller.startRectification();
            
        // Transform questions to structured format
        result.questionnaire.questions = transformQuestions(result.questionnaire.questions);
            
        // Store controller instance in session for subsequent requests
        req.session.rectificationController = controller;
        req.session.startTime = Date.now();
            
        res.json(result);
        
    } catch (error) {
        console.error('Error starting rectification:', error);
        res.status(500).json({
            error: 'Failed to start rectification process',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Process questionnaire response
router.post('/process-response', validateQuestionnaireResponse, async (req, res) => {
    try {
        const { responses } = req.body;
        const controller = req.session.rectificationController;
        
        if (!controller) {
            return res.status(400).json({
                error: 'No active rectification session',
                message: 'Please start a new rectification process',
                timestamp: new Date().toISOString()
            });
        }
        
        // Check session timeout
        const sessionAge = Date.now() - req.session.startTime;
        const timeoutMs = 30 * 60 * 1000; // 30 minutes
        if (sessionAge > timeoutMs) {
            delete req.session.rectificationController;
            delete req.session.startTime;
            return res.status(408).json({
                error: 'Session timeout',
                message: 'Please start a new rectification process',
                timestamp: new Date().toISOString()
            });
        }

        // Process responses
        const processedResponses = responses.map(response => ({
            ...response,
            followup_response: response.followup_response || null,
            confidence_level: response.confidence_level || 'medium',
            timestamp: new Date().toISOString()
        }));

        const result = await controller.processResponse(processedResponses);

        // Transform follow-up questions if needed
        if (result.status === 'need_more_responses' && result.followup_questions) {
            result.followup_questions = transformQuestions(result.followup_questions);
        }

        res.json(result);
        
    } catch (error) {
        console.error('Error processing response:', error);
        res.status(500).json({
            error: 'Failed to process response',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Get rectification progress
router.get('/progress', (req, res) => {
    try {
        const controller = req.session.rectificationController;
        
        if (!controller) {
            return res.status(400).json({
                error: 'No active rectification session',
                message: 'Please start a new rectification process',
                timestamp: new Date().toISOString()
            });
        }
        
        // Check session timeout
        const sessionAge = Date.now() - req.session.startTime;
        const timeoutMs = 30 * 60 * 1000; // 30 minutes
        if (sessionAge > timeoutMs) {
            delete req.session.rectificationController;
            delete req.session.startTime;
            return res.status(408).json({
                error: 'Session timeout',
                message: 'Please start a new rectification process',
                timestamp: new Date().toISOString()
            });
        }
        
        const progress = controller.getProgress();
        res.json({
            ...progress,
            session_age_minutes: Math.floor(sessionAge / 60000),
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error getting progress:', error);
        res.status(500).json({
            error: 'Failed to get progress',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Finalize rectification
router.post('/finalize', async (req, res) => {
    try {
        const controller = req.session.rectificationController;
        
        if (!controller) {
            return res.status(400).json({
                error: 'No active rectification session',
                message: 'Please start a new rectification process',
                timestamp: new Date().toISOString()
            });
        }
        
        // Check session timeout
        const sessionAge = Date.now() - req.session.startTime;
        const timeoutMs = 30 * 60 * 1000; // 30 minutes
        if (sessionAge > timeoutMs) {
            delete req.session.rectificationController;
            delete req.session.startTime;
            return res.status(408).json({
                error: 'Session timeout',
                message: 'Please start a new rectification process',
                timestamp: new Date().toISOString()
            });
        }
        
        const result = await controller.finalizeRectification();
        
        // Clear session after successful completion
        delete req.session.rectificationController;
        delete req.session.startTime;
        
        res.json({
            ...result,
            session_duration_minutes: Math.floor(sessionAge / 60000),
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error finalizing rectification:', error);
        res.status(500).json({
            error: 'Failed to finalize rectification',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Generate birth chart
router.post('/chart', validateBirthData, async (req, res) => {
    try {
        const { date, time, place, latitude, longitude, timezone } = req.body;
        
        // Create BirthData instance
        const birthData = {
            date,
            time,
            place,
            latitude,
            longitude,
            timezone
        };
        
        // Initialize rectification controller
        const controller = new RectificationController();
        
        // Generate preliminary chart
        const result = await controller.generatePreliminaryChart(birthData);
        
        res.json({
            status: 'success',
            birth_data: birthData,
            preliminary_analysis: result.preliminary_analysis,
            divisional_charts: result.divisional_charts,
            kp_analysis: result.kp_analysis
        });
        
    } catch (error) {
        console.error('Error generating chart:', error);
        res.status(500).json({
            error: 'Failed to generate birth chart',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

function transformQuestions(questions) {
    return questions.map(q => {
        // Career change questions
        if (q.text.includes('career change')) {
            return {
                ...q,
                type: 'boolean',
                followup: {
                    text: 'How quickly did this change occur?',
                    type: 'dropdown',
                    options: [
                        { value: 'sudden', label: 'Sudden' },
                        { value: 'weeks', label: 'Gradual over weeks' },
                        { value: 'months', label: 'Gradual over months' }
                    ]
                }
            };
        }
        
        // Promotion questions
        if (q.text.includes('promotions or recognition')) {
            return {
                ...q,
                type: 'boolean',
                followup: {
                    text: 'What type of recognition did you receive?',
                    type: 'multi-select',
                    options: [
                        { value: 'promotion', label: 'Promotion' },
                        { value: 'award', label: 'Award/Recognition' },
                        { value: 'salary', label: 'Salary Increase' },
                        { value: 'responsibilities', label: 'New Responsibilities' }
                    ]
                }
            };
        }
        
        // Partnership questions
        if (q.text.includes('partnerships')) {
            return {
                ...q,
                type: 'boolean',
                followup: {
                    text: 'What type of partnership was formed?',
                    type: 'dropdown',
                    options: [
                        { value: 'business', label: 'Business Partnership' },
                        { value: 'romantic', label: 'Romantic Relationship' },
                        { value: 'creative', label: 'Creative Collaboration' },
                        { value: 'other', label: 'Other Important Alliance' }
                    ]
                }
            };
        }

        // Default to boolean type for other questions
        return {
            ...q,
            type: 'boolean',
            confidence_required: true
        };
    });
}

async function collectInitialData(birth_date, birth_time, birth_place) {
    const { input_collection_function } = require('../../user_info_collector_preprocessor_agent1_1');
    
    try {
        const data = await input_collection_function(birth_date, birth_time, birth_place);
        return data;
    } catch (error) {
        console.error('Error collecting initial data:', error);
        throw new Error(`Failed to collect initial data: ${error.message}`);
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { birthDate, birthTime, birthPlace } = req.body;

        // Input validation
        if (!birthDate || !birthTime || !birthPlace) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        // Spawn Python process for birth time rectification
        const pythonProcess = spawn('python', [
            path.join(process.cwd(), 'backend/agents/birth_time_rectification.py'),
            JSON.stringify({
                date: birthDate,
                time: birthTime,
                place: birthPlace
            })
        ]);

        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error('Python process error:', errorString);
                return res.status(500).json({
                    error: 'Birth time rectification process failed'
                });
            }

            try {
                const result = JSON.parse(dataString);
                return res.status(200).json({
                    success: true,
                    data: {
                        originalTime: result.original_time,
                        rectifiedTime: result.rectified_time,
                        confidenceScore: result.confidence_score,
                        planetaryPositions: result.planetary_positions,
                        divisionalCharts: result.divisional_charts
                    }
                });
            } catch (error) {
                console.error('JSON parsing error:', error);
                return res.status(500).json({
                    error: 'Failed to parse rectification results'
                });
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
}

module.exports = router;
