import { BirthTimePredictor } from '../../../src/utils/ml/BirthTimePredictor';
import { TattwaAnalyzer } from '../../../src/backend/core/rectification/analysis/tattwa_analyzer';
import { PhysicalCorrelationCalculator } from '../../../src/backend/core/rectification/analysis/metrics/physical_correlation_calculator';
import { DashaVerificationCalculator } from '../../../src/backend/core/rectification/analysis/metrics/dasha_verification_calculator';
import type { BirthData } from '../../../src/backend/models/birth_data';

// Mock dependencies
jest.mock('../../../src/backend/core/rectification/analysis/tattwa_analyzer');
jest.mock('../../../src/backend/core/rectification/analysis/metrics/physical_correlation_calculator');
jest.mock('../../../src/backend/core/rectification/analysis/metrics/dasha_verification_calculator');

describe('BirthTimePredictor', () => {
    let predictor: BirthTimePredictor;
    let mockBirthData: BirthData;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Initialize predictor
        predictor = new BirthTimePredictor();

        // Setup mock birth data
        mockBirthData = {
            date: '1990-01-01',
            time: '12:00',
            latitude: 0,
            longitude: 0,
            timezone: 'UTC',
            certainty: 0.5,
            source: 'birth_certificate'
        };
    });

    describe('predictBirthTime', () => {
        it('should successfully predict birth time with all correlations', async () => {
            // Setup mock correlation results
            const mockPhysicalScores = {
                overall: 0.8,
                details: { height: 0.7, build: 0.8, complexion: 0.9 }
            };
            const mockEventScores = {
                overall: 0.75,
                details: { career: 0.8, relationship: 0.7 }
            };
            const mockDashaScores = {
                overall: 0.85,
                details: { mahadasha: 0.9, antardasha: 0.8 }
            };
            const mockTattwaScores = {
                overall: 0.9,
                details: { fire: 0.8, earth: 0.9, air: 0.85 }
            };

            // Mock the correlation calculation methods
            jest.spyOn(predictor as any, 'calculatePhysicalCorrelations')
                .mockResolvedValue(mockPhysicalScores);
            jest.spyOn(predictor as any, 'calculateEventCorrelations')
                .mockResolvedValue(mockEventScores);
            jest.spyOn(predictor as any, 'calculateDashaCorrelations')
                .mockResolvedValue(mockDashaScores);
            jest.spyOn(predictor as any, 'calculateTattwaCorrelations')
                .mockResolvedValue(mockTattwaScores);

            // Execute prediction
            const result = await predictor.predictBirthTime(mockBirthData);

            // Verify result structure
            expect(result).toHaveProperty('predictedTime');
            expect(result).toHaveProperty('confidence');
            expect(result).toHaveProperty('insights');
            expect(result).toHaveProperty('adjustmentMinutes');
            expect(result).toHaveProperty('correlationScores');

            // Verify correlation scores
            expect(result.correlationScores).toEqual({
                physical: 0.8,
                events: 0.75,
                dashas: 0.85,
                tattwa: 0.9
            });

            // Verify confidence calculation
            expect(result.confidence).toBeGreaterThan(0);
            expect(result.confidence).toBeLessThanOrEqual(1);
        });

        it('should handle missing birth data gracefully', async () => {
            const incompleteBirthData = { ...mockBirthData };
            delete incompleteBirthData.time;

            await expect(predictor.predictBirthTime(incompleteBirthData as BirthData))
                .rejects
                .toThrow('Birth time prediction failed');
        });

        it('should handle correlation calculation errors', async () => {
            // Mock a failure in physical correlation calculation
            jest.spyOn(predictor as any, 'calculatePhysicalCorrelations')
                .mockRejectedValue(new Error('Physical correlation failed'));

            await expect(predictor.predictBirthTime(mockBirthData))
                .rejects
                .toThrow('Birth time prediction failed: Physical correlation failed');
        });

        it('should generate insights based on correlations', async () => {
            // Setup mock correlation results with high confidence
            const mockPhysicalScores = {
                overall: 0.9,
                details: { height: 0.9, build: 0.9, complexion: 0.9 }
            };
            const mockEventScores = {
                overall: 0.9,
                details: { career: 0.9, relationship: 0.9 }
            };
            const mockDashaScores = {
                overall: 0.9,
                details: { mahadasha: 0.9, antardasha: 0.9 }
            };
            const mockTattwaScores = {
                overall: 0.9,
                details: { fire: 0.9, earth: 0.9, air: 0.9 }
            };

            // Mock the correlation calculation methods
            jest.spyOn(predictor as any, 'calculatePhysicalCorrelations')
                .mockResolvedValue(mockPhysicalScores);
            jest.spyOn(predictor as any, 'calculateEventCorrelations')
                .mockResolvedValue(mockEventScores);
            jest.spyOn(predictor as any, 'calculateDashaCorrelations')
                .mockResolvedValue(mockDashaScores);
            jest.spyOn(predictor as any, 'calculateTattwaCorrelations')
                .mockResolvedValue(mockTattwaScores);

            // Execute prediction
            const result = await predictor.predictBirthTime(mockBirthData);

            // Verify insights generation
            expect(result.insights).toBeInstanceOf(Array);
            expect(result.insights.length).toBeGreaterThan(0);
            expect(result.insights[0]).toHaveProperty('type');
            expect(result.insights[0]).toHaveProperty('description');
            expect(result.insights[0]).toHaveProperty('confidence');
        });

        it('should calculate time adjustment correctly', async () => {
            // Setup mock correlation results with varying confidence levels
            const mockPhysicalScores = {
                overall: 0.6,
                details: { height: 0.6, build: 0.6, complexion: 0.6 }
            };
            const mockEventScores = {
                overall: 0.7,
                details: { career: 0.7, relationship: 0.7 }
            };
            const mockDashaScores = {
                overall: 0.8,
                details: { mahadasha: 0.8, antardasha: 0.8 }
            };
            const mockTattwaScores = {
                overall: 0.9,
                details: { fire: 0.9, earth: 0.9, air: 0.9 }
            };

            // Mock the correlation calculation methods
            jest.spyOn(predictor as any, 'calculatePhysicalCorrelations')
                .mockResolvedValue(mockPhysicalScores);
            jest.spyOn(predictor as any, 'calculateEventCorrelations')
                .mockResolvedValue(mockEventScores);
            jest.spyOn(predictor as any, 'calculateDashaCorrelations')
                .mockResolvedValue(mockDashaScores);
            jest.spyOn(predictor as any, 'calculateTattwaCorrelations')
                .mockResolvedValue(mockTattwaScores);

            // Execute prediction
            const result = await predictor.predictBirthTime(mockBirthData);

            // Verify time adjustment
            expect(result.adjustmentMinutes).toBeDefined();
            expect(result.adjustmentMinutes % 5).toBe(0); // Should be rounded to nearest 5 minutes
            expect(result.predictedTime).toMatch(/^\d{2}:\d{2}$/); // Should be in HH:mm format
        });
    });
}); 