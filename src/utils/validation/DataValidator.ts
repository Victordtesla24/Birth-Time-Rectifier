import type { BirthData } from '../../backend/models/birth_data';

export interface ValidationError {
    field: string;
    message: string;
    code: string;
    severity: 'error' | 'warning';
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
    sanitizedData?: BirthData;
}

export class DataValidator {
    private readonly DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
    private readonly TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
    private readonly LATITUDE_RANGE = { min: -90, max: 90 };
    private readonly LONGITUDE_RANGE = { min: -180, max: 180 };
    
    public validateBirthData(data: Partial<BirthData>): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationError[] = [];
        
        try {
            // Required field validation
            this.validateRequiredFields(data, errors);
            
            // Format validation
            if (data.date) this.validateDate(data.date, errors);
            if (data.time) this.validateTime(data.time, errors);
            if (data.latitude) this.validateLatitude(data.latitude, errors);
            if (data.longitude) this.validateLongitude(data.longitude, errors);
            if (data.timezone) this.validateTimezone(data.timezone, errors);
            
            // Data consistency validation
            this.validateDataConsistency(data, errors, warnings);
            
            // Physical characteristics validation
            if (data.physical_characteristics) {
                this.validatePhysicalCharacteristics(data.physical_characteristics, errors, warnings);
            }
            
            // Life events validation
            if (data.life_events) {
                this.validateLifeEvents(data.life_events, data.date, errors, warnings);
            }
            
            // Sanitize data if no errors
            const sanitizedData = errors.length === 0 ? this.sanitizeData(data) : undefined;
            
            return {
                isValid: errors.length === 0,
                errors,
                warnings,
                sanitizedData
            };
        } catch (error) {
            errors.push({
                field: 'general',
                message: `Validation failed: ${error.message}`,
                code: 'VALIDATION_FAILED',
                severity: 'error'
            });
            
            return {
                isValid: false,
                errors,
                warnings
            };
        }
    }
    
    private validateRequiredFields(data: Partial<BirthData>, errors: ValidationError[]): void {
        const requiredFields = ['date', 'time', 'latitude', 'longitude', 'timezone'];
        
        requiredFields.forEach(field => {
            if (!data[field]) {
                errors.push({
                    field,
                    message: `${field} is required`,
                    code: 'REQUIRED_FIELD',
                    severity: 'error'
                });
            }
        });
    }
    
    private validateDate(date: string, errors: ValidationError[]): void {
        if (!this.DATE_REGEX.test(date)) {
            errors.push({
                field: 'date',
                message: 'Invalid date format. Use YYYY-MM-DD',
                code: 'INVALID_DATE_FORMAT',
                severity: 'error'
            });
            return;
        }
        
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            errors.push({
                field: 'date',
                message: 'Invalid date',
                code: 'INVALID_DATE',
                severity: 'error'
            });
        }
    }
    
    private validateTime(time: string, errors: ValidationError[]): void {
        if (!this.TIME_REGEX.test(time)) {
            errors.push({
                field: 'time',
                message: 'Invalid time format. Use HH:mm (24-hour)',
                code: 'INVALID_TIME_FORMAT',
                severity: 'error'
            });
        }
    }
    
    private validateLatitude(latitude: number, errors: ValidationError[]): void {
        if (
            typeof latitude !== 'number' ||
            latitude < this.LATITUDE_RANGE.min ||
            latitude > this.LATITUDE_RANGE.max
        ) {
            errors.push({
                field: 'latitude',
                message: 'Invalid latitude. Must be between -90 and 90',
                code: 'INVALID_LATITUDE',
                severity: 'error'
            });
        }
    }
    
    private validateLongitude(longitude: number, errors: ValidationError[]): void {
        if (
            typeof longitude !== 'number' ||
            longitude < this.LONGITUDE_RANGE.min ||
            longitude > this.LONGITUDE_RANGE.max
        ) {
            errors.push({
                field: 'longitude',
                message: 'Invalid longitude. Must be between -180 and 180',
                code: 'INVALID_LONGITUDE',
                severity: 'error'
            });
        }
    }
    
    private validateTimezone(timezone: string, errors: ValidationError[]): void {
        try {
            Intl.DateTimeFormat(undefined, { timeZone: timezone });
        } catch {
            errors.push({
                field: 'timezone',
                message: 'Invalid timezone',
                code: 'INVALID_TIMEZONE',
                severity: 'error'
            });
        }
    }
    
    private validateDataConsistency(
        data: Partial<BirthData>,
        errors: ValidationError[],
        warnings: ValidationError[]
    ): void {
        // Check birth time certainty
        if (data.certainty !== undefined) {
            if (data.certainty < 0 || data.certainty > 1) {
                errors.push({
                    field: 'certainty',
                    message: 'Certainty must be between 0 and 1',
                    code: 'INVALID_CERTAINTY',
                    severity: 'error'
                });
            } else if (data.certainty < 0.5) {
                warnings.push({
                    field: 'certainty',
                    message: 'Low birth time certainty may affect accuracy',
                    code: 'LOW_CERTAINTY',
                    severity: 'warning'
                });
            }
        }
        
        // Check source reliability
        if (data.source === 'approximate' || data.source === 'family_memory') {
            warnings.push({
                field: 'source',
                message: 'Birth time source may not be reliable',
                code: 'UNRELIABLE_SOURCE',
                severity: 'warning'
            });
        }
    }
    
    private validatePhysicalCharacteristics(
        characteristics: Record<string, any>,
        errors: ValidationError[],
        warnings: ValidationError[]
    ): void {
        if (characteristics.height) {
            const height = Number(characteristics.height);
            if (isNaN(height) || height < 0 || height > 300) {
                errors.push({
                    field: 'physical_characteristics.height',
                    message: 'Invalid height',
                    code: 'INVALID_HEIGHT',
                    severity: 'error'
                });
            }
        }
        
        const validBuilds = ['Slim', 'Athletic', 'Medium', 'Well-built', 'Heavy'];
        if (characteristics.build && !validBuilds.includes(characteristics.build)) {
            errors.push({
                field: 'physical_characteristics.build',
                message: 'Invalid build type',
                code: 'INVALID_BUILD',
                severity: 'error'
            });
        }
        
        const validComplexions = ['Fair', 'Medium', 'Olive', 'Dark', 'Reddish'];
        if (characteristics.complexion && !validComplexions.includes(characteristics.complexion)) {
            errors.push({
                field: 'physical_characteristics.complexion',
                message: 'Invalid complexion type',
                code: 'INVALID_COMPLEXION',
                severity: 'error'
            });
        }
    }
    
    private validateLifeEvents(
        events: Array<{
            type: string;
            date: string;
            description: string;
            confidence: number;
        }>,
        birthDate: string,
        errors: ValidationError[],
        warnings: ValidationError[]
    ): void {
        const birthTimestamp = new Date(birthDate).getTime();
        
        events.forEach((event, index) => {
            // Validate date format
            if (!this.DATE_REGEX.test(event.date)) {
                errors.push({
                    field: `life_events[${index}].date`,
                    message: 'Invalid date format. Use YYYY-MM-DD',
                    code: 'INVALID_EVENT_DATE_FORMAT',
                    severity: 'error'
                });
                return;
            }
            
            // Validate event is after birth
            const eventTimestamp = new Date(event.date).getTime();
            if (eventTimestamp < birthTimestamp) {
                errors.push({
                    field: `life_events[${index}].date`,
                    message: 'Event date cannot be before birth date',
                    code: 'EVENT_BEFORE_BIRTH',
                    severity: 'error'
                });
            }
            
            // Validate confidence
            if (
                typeof event.confidence !== 'number' ||
                event.confidence < 0 ||
                event.confidence > 1
            ) {
                errors.push({
                    field: `life_events[${index}].confidence`,
                    message: 'Confidence must be between 0 and 1',
                    code: 'INVALID_EVENT_CONFIDENCE',
                    severity: 'error'
                });
            }
            
            // Validate description
            if (!event.description || event.description.length < 5) {
                warnings.push({
                    field: `life_events[${index}].description`,
                    message: 'Event description is too short',
                    code: 'SHORT_EVENT_DESCRIPTION',
                    severity: 'warning'
                });
            }
        });
    }
    
    private sanitizeData(data: Partial<BirthData>): BirthData {
        return {
            ...data,
            date: data.date!,
            time: data.time!,
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
            timezone: data.timezone!,
            certainty: data.certainty || 0.5,
            source: data.source || 'approximate',
            physical_characteristics: this.sanitizePhysicalCharacteristics(data.physical_characteristics),
            life_events: this.sanitizeLifeEvents(data.life_events),
            verification_scores: data.verification_scores || {}
        };
    }
    
    private sanitizePhysicalCharacteristics(
        characteristics: Record<string, any> = {}
    ): Record<string, any> {
        return {
            height: characteristics.height ? Number(characteristics.height) : undefined,
            build: characteristics.build || undefined,
            complexion: characteristics.complexion || undefined,
            ...characteristics
        };
    }
    
    private sanitizeLifeEvents(
        events: Array<{
            type: string;
            date: string;
            description: string;
            confidence: number;
        }> = []
    ): Array<{
        type: string;
        date: string;
        description: string;
        confidence: number;
    }> {
        return events.map(event => ({
            type: event.type,
            date: event.date,
            description: event.description,
            confidence: Number(event.confidence) || 0.5
        }));
    }
} 