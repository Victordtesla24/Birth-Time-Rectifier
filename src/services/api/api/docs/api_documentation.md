# Birth Time Rectifier API Documentation

## Overview

The Birth Time Rectifier API provides advanced astrological calculations and birth time rectification services. This API uses machine learning and traditional astrological techniques to determine the most accurate birth time based on life events and other factors.

## Authentication

All API requests require authentication using JWT tokens. To obtain a token:

```bash
POST /api/auth/token
Content-Type: application/json

{
    "username": "your_username",
    "password": "your_password"
}
```

Include the token in all subsequent requests:

```bash
Authorization: Bearer <your_token>
```

## API Versioning

The current stable version is `v1`. Include the version in the URL:
```
https://api.birthrectifier.com/v1/...
```

## Rate Limiting

- Free tier: 100 requests/hour
- Pro tier: 1000 requests/hour
- Enterprise tier: Custom limits

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Endpoints

### Birth Time Rectification

#### Start Rectification

```graphql
mutation StartRectification($input: RectificationInput!) {
    startRectification(input: $input) {
        id
        status
        estimatedDuration
    }
}
```

Input schema:
```typescript
interface RectificationInput {
    birthData: {
        date: string;          // ISO 8601 format
        approximateTime: string;// HH:mm format
        latitude: number;      // -90 to 90
        longitude: number;     // -180 to 180
        location: string;      // City, Country
    };
    events: Array<{
        type: string;         // career|relationship|health|etc
        date: string;         // ISO 8601 format
        description: string;
        significance: number; // 0 to 1
    }>;
}
```

#### Get Rectification Status

```graphql
query GetRectificationStatus($id: ID!) {
    rectificationStatus(id: $id) {
        status
        progress
        currentStage
        estimatedTimeRemaining
        confidence
    }
}
```

#### Get Rectification Result

```graphql
query GetRectificationResult($id: ID!) {
    rectificationResult(id: $id) {
        originalTime
        rectifiedTime
        confidence
        adjustmentMinutes
        confidenceMetrics {
            overall
            eventCorrelation
            planetaryStrength
            dashaAnalysis
        }
        planetaryPositions {
            planet
            longitude
            latitude
            speed
            house
        }
    }
}
```

### WebSocket Subscriptions

Connect to the WebSocket endpoint:
```
wss://api.birthrectifier.com/v1/ws
```

Subscribe to rectification updates:
```graphql
subscription OnRectificationUpdate($id: ID!) {
    rectificationUpdate(id: $id) {
        status
        progress
        currentStage
        message
    }
}
```

## Error Handling

All errors follow the standard GraphQL error format:

```json
{
    "errors": [
        {
            "message": "Detailed error message",
            "path": ["startRectification"],
            "extensions": {
                "code": "VALIDATION_ERROR",
                "details": {...}
            }
        }
    ]
}
```

Common error codes:
- `VALIDATION_ERROR`: Invalid input data
- `AUTHENTICATION_ERROR`: Invalid or expired token
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `CALCULATION_ERROR`: Error in astrological calculations
- `ML_SERVICE_ERROR`: Machine learning service error

## Security

1. **Authentication**
   - JWT-based authentication
   - Token expiration: 24 hours
   - Refresh token support

2. **Data Protection**
   - All data encrypted in transit (TLS 1.3)
   - Sensitive data encrypted at rest (AES-256)
   - Regular security audits

3. **API Security**
   - Rate limiting
   - Request signing
   - IP whitelisting (Enterprise tier)
   - CORS configuration

## Analytics

Access API usage analytics through the dashboard or API:

```graphql
query GetAPIAnalytics($timeframe: String!) {
    apiAnalytics(timeframe: $timeframe) {
        requests {
            total
            successful
            failed
        }
        endpoints {
            path
            calls
            avgResponseTime
            errorRate
        }
        performance {
            p50ResponseTime
            p95ResponseTime
            p99ResponseTime
        }
    }
}
```

## SDKs and Client Libraries

Official SDKs:
- [Python SDK](https://github.com/birthrectifier/python-sdk)
- [JavaScript SDK](https://github.com/birthrectifier/js-sdk)
- [Java SDK](https://github.com/birthrectifier/java-sdk)

## Changelog

### v1.1.0 (2024-03-15)
- Added WebSocket support for real-time updates
- Improved ML model accuracy
- Added new event types

### v1.0.0 (2024-01-01)
- Initial stable release
- Basic rectification functionality
- REST API endpoints 