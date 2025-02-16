import React, { useState } from 'react';
import { Box } from '@mui/material';
import { BirthTimeRectifier } from './BirthTimeRectifier';
import { ApiClient } from '../services/api';

interface BirthData {
    birthDate: Date | null;
    birthTime: string | null; 
    location: string;
    preliminaryAnalysis?: any;
}

export const StepWizard = ({ apiClient }: { apiClient: ApiClient }) => {
    const [birthData, setBirthData] = useState<BirthData>({
        birthDate: null,
        birthTime: null,
        location: ''
    });
    const [preliminaryResults, setPreliminaryResults] = useState<any>(null);
    const [questionnaireResults, setQuestionnaireResults] = useState<any>(null);
    const [finalResults, setFinalResults] = useState<any>(null);

    const handleBirthDataSubmit = (data: BirthData) => {
        if (data && typeof data === 'object') {
            setBirthData(data);
            if (data.preliminaryAnalysis) {
                setPreliminaryResults(data.preliminaryAnalysis);
            } else {
                setPreliminaryResults(null); // Reset results when new data is submitted
            }
            // Reset later stage results
            setQuestionnaireResults(null);
            setFinalResults(null);
        }
    };

    const handlePreliminaryComplete = (results: any) => {
        setPreliminaryResults(results);
    };

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <BirthTimeRectifier
                initialValues={birthData}
                onSubmit={handleBirthDataSubmit}
                apiClient={apiClient}
            />
        </Box>
    );
}; 