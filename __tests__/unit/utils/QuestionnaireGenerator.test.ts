import { QuestionnaireGenerator } from '../../../src/utils/questionnaire/QuestionnaireGenerator';
import type { ConfidenceData } from '../../../src/utils/chart/types/visualization';
import type { BirthData } from '../../../src/backend/models/birth_data';
import type { MLInsight } from '../../../src/utils/chart/types/visualization';

describe('QuestionnaireGenerator', () => {
    let generator: QuestionnaireGenerator;
    let mockConfidence: ConfidenceData;
    let mockBirthData: BirthData;
    let mockInsights: MLInsight[];

    beforeEach(() => {
        generator = new QuestionnaireGenerator();

        mockConfidence = {
            overall: 0.7,
            components: {
                physical_appearance: 0.6,
                event_correlations: 0.7,
                birth_time_accuracy: 0.8
            }
        };

        mockBirthData = {
            date: '1990-01-01',
            time: '12:00',
            latitude: 0,
            longitude: 0,
            timezone: 'UTC',
            certainty: 0.5,
            source: 'birth_certificate'
        };

        mockInsights = [{
            type: 'pattern',
            description: 'Test insight',
            confidence: 0.8,
            relatedElements: [
                { type: 'planet', id: 'sun', significance: 0.8 }
            ],
            visualCues: [
                {
                    type: 'highlight',
                    elements: ['sun'],
                    style: { color: '#2196F3', thickness: 2 }
                }
            ]
        }];
    });

    describe('generateQuestionnaire', () => {
        it('should generate sections based on confidence metrics', () => {
            const sections = generator.generateQuestionnaire(
                mockConfidence,
                mockBirthData,
                mockInsights
            );

            // Verify sections are generated
            expect(sections).toBeInstanceOf(Array);
            expect(sections.length).toBeGreaterThan(0);

            // Verify section structure
            const firstSection = sections[0];
            expect(firstSection).toHaveProperty('id');
            expect(firstSection).toHaveProperty('title');
            expect(firstSection).toHaveProperty('description');
            expect(firstSection).toHaveProperty('questions');
            expect(firstSection).toHaveProperty('priority');
            expect(firstSection).toHaveProperty('confidence');
        });

        it('should prioritize sections based on confidence scores', () => {
            const sections = generator.generateQuestionnaire(
                mockConfidence,
                mockBirthData,
                mockInsights
            );

            // Verify sections are sorted by priority
            for (let i = 1; i < sections.length; i++) {
                expect(sections[i].priority).toBeLessThanOrEqual(sections[i - 1].priority);
            }
        });

        it('should generate physical verification questions for low physical confidence', () => {
            mockConfidence.components.physical_appearance = 0.3;

            const sections = generator.generateQuestionnaire(
                mockConfidence,
                mockBirthData,
                mockInsights
            );

            // Find physical verification section
            const physicalSection = sections.find(s => s.id === 'physical_verification');
            expect(physicalSection).toBeDefined();
            expect(physicalSection!.questions.length).toBeGreaterThan(0);
            expect(physicalSection!.priority).toBeGreaterThan(1);
        });

        it('should generate event verification questions for low event confidence', () => {
            mockConfidence.components.event_correlations = 0.3;

            const sections = generator.generateQuestionnaire(
                mockConfidence,
                mockBirthData,
                mockInsights
            );

            // Find event verification section
            const eventSection = sections.find(s => s.id === 'event_verification');
            expect(eventSection).toBeDefined();
            expect(eventSection!.questions.length).toBeGreaterThan(0);
            expect(eventSection!.priority).toBeGreaterThan(1);
        });

        it('should generate timing verification questions for low overall confidence', () => {
            mockConfidence.overall = 0.3;

            const sections = generator.generateQuestionnaire(
                mockConfidence,
                mockBirthData,
                mockInsights
            );

            // Find timing verification section
            const timingSection = sections.find(s => s.id === 'timing_verification');
            expect(timingSection).toBeDefined();
            expect(timingSection!.questions.length).toBeGreaterThan(0);
            expect(timingSection!.priority).toBeGreaterThan(1);
        });

        it('should include ML-based insight questions', () => {
            const sections = generator.generateQuestionnaire(
                mockConfidence,
                mockBirthData,
                mockInsights
            );

            // Find verification section
            const verificationSection = sections.find(s => s.id === 'final_verification');
            expect(verificationSection).toBeDefined();

            // Verify ML insight questions are included
            const insightQuestions = verificationSection!.questions.filter(
                q => q.id.startsWith('insight_')
            );
            expect(insightQuestions.length).toBe(mockInsights.length);
        });

        it('should handle empty insights array', () => {
            const sections = generator.generateQuestionnaire(
                mockConfidence,
                mockBirthData,
                []
            );

            // Verify questionnaire is still generated
            expect(sections).toBeInstanceOf(Array);
            expect(sections.length).toBeGreaterThan(0);

            // Verify no insight questions are generated
            const allQuestions = sections.flatMap(s => s.questions);
            const insightQuestions = allQuestions.filter(q => q.id.startsWith('insight_'));
            expect(insightQuestions.length).toBe(0);
        });

        it('should handle missing birth data', () => {
            const sections = generator.generateQuestionnaire(
                mockConfidence,
                {} as BirthData,
                mockInsights
            );

            // Verify questionnaire is still generated
            expect(sections).toBeInstanceOf(Array);
            expect(sections.length).toBeGreaterThan(0);

            // Verify timing verification section is included with high priority
            const timingSection = sections.find(s => s.id === 'timing_verification');
            expect(timingSection).toBeDefined();
            expect(timingSection!.priority).toBeGreaterThan(1);
        });
    });
}); 