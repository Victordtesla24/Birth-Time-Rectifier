declare module '../../src/components/BirthTimeRectifier' {
    import { FC } from 'react';

    export interface BirthTimeRectifierProps {
        onSubmit?: (data: {
            birthDate: string;
            birthTime: string;
            location: string;
            answers?: Record<string, any>;
        }) => void;
        initialData?: {
            birthDate?: string;
            birthTime?: string;
            location?: string;
        };
    }

    export const BirthTimeRectifier: FC<BirthTimeRectifierProps>;
}

declare module '../../src/components/steps/DynamicQuestionnaire' {
    import { FC } from 'react';

    export interface DynamicQuestionnaireProps {
        onNext: (answers: Record<string, any>) => void;
        previousData?: {
            birthDate?: string;
            birthTime?: string;
            location?: string;
            answers?: Record<string, any>;
        };
    }

    export const DynamicQuestionnaire: FC<DynamicQuestionnaireProps>;
}

declare module '../../src/components/StepWizard' {
    import { FC, ReactNode } from 'react';

    export interface StepWizardProps {
        children: ReactNode;
        activeStep?: number;
        onStepChange?: (step: number) => void;
    }

    export const StepWizard: FC<StepWizardProps>;
}

declare module '../../src/theme' {
    import { Theme } from '@mui/material/styles';
    
    export const theme: Theme;
} 