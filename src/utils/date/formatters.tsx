/**
 * Format time string to display format
 * @param {string} time - Time string in HH:mm format
 * @returns {string} Formatted time string
 */
export const formatTime = (time) => {
    if (!time) return '';
    return time.replace(/^(\d{1,2}):(\d{2})$/, (_, h, m) => `${h.padStart(2, '0')}:${m}`);
};

export const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString();
};

export const calculateConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
};

export const formatPercentage = (value) => {
    
    try {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error('Error formatting time:', error);
        return time; // Return original time if formatting fails
    }
}; 