export const config = {
    api: {
        baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
        endpoints: {
            birthChart: '/api/birth-chart',
            rectifyBirthTime: '/api/rectify-birth-time',
            chartInsights: '/api/chart-insights',
            questionnaire: '/api/questionnaire',
        },
    },
    chart: {
        width: 800,
        height: 600,
        margin: {
            top: 20,
            right: 20,
            bottom: 30,
            left: 40,
        },
    },
    animation: {
        duration: 1000,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
}; 