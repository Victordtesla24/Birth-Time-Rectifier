import { DataValidator } from '../../../src/utils/validation/DataValidator';
import type { BirthData } from '../../../src/backend/models/birth_data';

describe('DataValidator', () => {
    let validator: DataValidator;
    let validBirthData: BirthData;

    beforeEach(() => {
        validator = new DataValidator();

        validBirthData = {
            date: '1990-01-01',
            time: '12:00',
            latitude: 0,
            longitude: 0,
            timezone: 'UTC',
            certainty: 0.5,
            source: 'birth_certificate'
        };
    });

    describe('validateBirthData', () => {
        it('should validate complete and valid birth data', () => {
            const result = validator.validateBirthData(validBirthData);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.sanitizedData).toBeDefined();
        });

        it('should detect missing required fields', () => {
            const incompleteBirthData = { ...validBirthData };
            delete incompleteBirthData.time;

            const result = validator.validateBirthData(incompleteBirthData);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toEqual({
                field: 'time',
                message: 'time is required',
                code: 'REQUIRED_FIELD',
                severity: 'error'
            });
        });

        it('should validate date format', () => {
            const invalidDateData = {
                ...validBirthData,
                date: '01-01-1990' // Wrong format
            };

            const result = validator.validateBirthData(invalidDateData);

            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toEqual({
                field: 'date',
                message: 'Invalid date format. Use YYYY-MM-DD',
                code: 'INVALID_DATE_FORMAT',
                severity: 'error'
            });
        });

        it('should validate time format', () => {
            const invalidTimeData = {
                ...validBirthData,
                time: '25:00' // Invalid hour
            };

            const result = validator.validateBirthData(invalidTimeData);

            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toEqual({
                field: 'time',
                message: 'Invalid time format. Use HH:mm (24-hour)',
                code: 'INVALID_TIME_FORMAT',
                severity: 'error'
            });
        });

        it('should validate latitude range', () => {
            const invalidLatitudeData = {
                ...validBirthData,
                latitude: 100 // Out of range
            };

            const result = validator.validateBirthData(invalidLatitudeData);

            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toEqual({
                field: 'latitude',
                message: 'Invalid latitude. Must be between -90 and 90',
                code: 'INVALID_LATITUDE',
                severity: 'error'
            });
        });

        it('should validate longitude range', () => {
            const invalidLongitudeData = {
                ...validBirthData,
                longitude: 200 // Out of range
            };

            const result = validator.validateBirthData(invalidLongitudeData);

            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toEqual({
                field: 'longitude',
                message: 'Invalid longitude. Must be between -180 and 180',
                code: 'INVALID_LONGITUDE',
                severity: 'error'
            });
        });

        it('should validate timezone', () => {
            const invalidTimezoneData = {
                ...validBirthData,
                timezone: 'Invalid/Timezone'
            };

            const result = validator.validateBirthData(invalidTimezoneData);

            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toEqual({
                field: 'timezone',
                message: 'Invalid timezone',
                code: 'INVALID_TIMEZONE',
                severity: 'error'
            });
        });

        it('should validate certainty range', () => {
            const invalidCertaintyData = {
                ...validBirthData,
                certainty: 2 // Out of range
            };

            const result = validator.validateBirthData(invalidCertaintyData);

            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toEqual({
                field: 'certainty',
                message: 'Certainty must be between 0 and 1',
                code: 'INVALID_CERTAINTY',
                severity: 'error'
            });
        });

        it('should warn about low certainty', () => {
            const lowCertaintyData = {
                ...validBirthData,
                certainty: 0.3
            };

            const result = validator.validateBirthData(lowCertaintyData);

            expect(result.isValid).toBe(true);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0]).toEqual({
                field: 'certainty',
                message: 'Low birth time certainty may affect accuracy',
                code: 'LOW_CERTAINTY',
                severity: 'warning'
            });
        });

        it('should warn about unreliable source', () => {
            const unreliableSourceData = {
                ...validBirthData,
                source: 'approximate'
            };

            const result = validator.validateBirthData(unreliableSourceData);

            expect(result.isValid).toBe(true);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0]).toEqual({
                field: 'source',
                message: 'Birth time source may not be reliable',
                code: 'UNRELIABLE_SOURCE',
                severity: 'warning'
            });
        });

        it('should validate physical characteristics', () => {
            const invalidPhysicalData = {
                ...validBirthData,
                physical_characteristics: {
                    height: -1, // Invalid height
                    build: 'Invalid', // Invalid build type
                    complexion: 'Invalid' // Invalid complexion type
                }
            };

            const result = validator.validateBirthData(invalidPhysicalData);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(3);
            expect(result.errors).toEqual(expect.arrayContaining([
                {
                    field: 'physical_characteristics.height',
                    message: 'Invalid height',
                    code: 'INVALID_HEIGHT',
                    severity: 'error'
                },
                {
                    field: 'physical_characteristics.build',
                    message: 'Invalid build type',
                    code: 'INVALID_BUILD',
                    severity: 'error'
                },
                {
                    field: 'physical_characteristics.complexion',
                    message: 'Invalid complexion type',
                    code: 'INVALID_COMPLEXION',
                    severity: 'error'
                }
            ]));
        });

        it('should validate life events', () => {
            const invalidEventsData = {
                ...validBirthData,
                life_events: [
                    {
                        type: 'career',
                        date: '1989-01-01', // Before birth
                        description: 'Job', // Too short
                        confidence: 2 // Out of range
                    }
                ]
            };

            const result = validator.validateBirthData(invalidEventsData);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(2);
            expect(result.warnings).toHaveLength(1);
            expect(result.errors).toEqual(expect.arrayContaining([
                {
                    field: 'life_events[0].date',
                    message: 'Event date cannot be before birth date',
                    code: 'EVENT_BEFORE_BIRTH',
                    severity: 'error'
                },
                {
                    field: 'life_events[0].confidence',
                    message: 'Confidence must be between 0 and 1',
                    code: 'INVALID_EVENT_CONFIDENCE',
                    severity: 'error'
                }
            ]));
            expect(result.warnings).toEqual(expect.arrayContaining([
                {
                    field: 'life_events[0].description',
                    message: 'Event description is too short',
                    code: 'SHORT_EVENT_DESCRIPTION',
                    severity: 'warning'
                }
            ]));
        });

        it('should sanitize valid data', () => {
            const validData = {
                ...validBirthData,
                physical_characteristics: {
                    height: '180', // String number
                    build: 'Athletic',
                    complexion: 'Fair'
                },
                life_events: [
                    {
                        type: 'career',
                        date: '2010-01-01',
                        description: 'Started new job',
                        confidence: '0.8' // String number
                    }
                ]
            };

            const result = validator.validateBirthData(validData);

            expect(result.isValid).toBe(true);
            expect(result.sanitizedData).toBeDefined();
            expect(result.sanitizedData!.physical_characteristics!.height).toBe(180);
            expect(result.sanitizedData!.life_events![0].confidence).toBe(0.8);
        });
    });
}); 