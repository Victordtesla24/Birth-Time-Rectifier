"""Enhanced event analysis module for birth time rectification."""

from datetime import datetime
from typing import Dict, Any, List, Optional
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from ..models.birth_data import BirthData
from .planetary_calculator import PlanetaryCalculator
from .dasha_calculator import DashaCalculator

class EventAnalyzer:
    """Analyzes life events for birth time rectification."""
    
    def __init__(self):
        """Initialize the EventAnalyzer with required calculators."""
        self.planetary_calculator = PlanetaryCalculator()
        self.dasha_calculator = DashaCalculator()
        self.divisional_mappings = {
            'career': ['D10', 'D24'],
            'relationship': ['D9', 'D20'],
            'health': ['D30'],
            'education': ['D24'],
            'spirituality': ['D20', 'D60']
        }
    
    def analyze_events(self, birth_data: Optional[BirthData], events: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Perform comprehensive analysis of life events."""
        try:
            if not birth_data or not events or not self._validate_events(events):
                return self._get_fallback_analysis()
            
            # Calculate base planetary positions
            base_positions = self.planetary_calculator.calculate_positions(birth_data)
            
            # Perform all analyses
            patterns = self._analyze_event_patterns(events)
            dasha_correlations = self._analyze_dasha_periods(birth_data, events)
            divisional_correlations = self._analyze_divisional_charts(birth_data, events, base_positions)
            period_analysis = self._analyze_time_periods(birth_data, events)
            event_correlations = self._correlate_events(events)
            ml_patterns = self._detect_ml_patterns(events, base_positions)
            
            # Calculate confidence scores
            confidence_scores = self._calculate_confidence_scores(
                patterns,
                dasha_correlations,
                divisional_correlations,
                period_analysis,
                event_correlations,
                ml_patterns
            )
            
            return {
                'patterns': patterns,
                'dasha_correlations': dasha_correlations,
                'divisional_correlations': divisional_correlations,
                'period_analysis': period_analysis,
                'event_correlations': event_correlations,
                'ml_patterns': ml_patterns,
                'confidence_scores': confidence_scores
            }
            
        except Exception as e:
            print(f"Error in event analysis: {str(e)}")
            return self._get_fallback_analysis()
    
    def _analyze_event_patterns(self, events: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze sophisticated patterns in events."""
        timing_patterns = self._analyze_timing_patterns(events)
        type_patterns = self._analyze_type_patterns(events)
        intensity_patterns = self._analyze_intensity_patterns(events)
        cyclical_patterns = self._analyze_cyclical_patterns(events)
        
        return {
            'timing_patterns': timing_patterns,
            'type_patterns': type_patterns,
            'intensity_patterns': intensity_patterns,
            'cyclical_patterns': cyclical_patterns
        }
    
    def _analyze_dasha_periods(self, birth_data: BirthData, events: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
        """Analyze dasha periods for each event."""
        correlations = {}
        
        for event in events:
            event_time = event['time']
            dasha_details = self.dasha_calculator.calculate_dashas(birth_data, event_time)
            
            correlation_score = self._calculate_dasha_correlation(
                dasha_details,
                event['type'],
                event['intensity']
            )
            
            correlations[event['id']] = {
                'maha_dasha': dasha_details['maha_dasha'],
                'antar_dasha': dasha_details['antar_dasha'],
                'pratyantar_dasha': dasha_details['pratyantar_dasha'],
                'correlation_score': correlation_score
            }
        
        return correlations
    
    def _analyze_divisional_charts(
        self,
        birth_data: BirthData,
        events: List[Dict[str, Any]],
        base_positions: Dict[str, float]
    ) -> Dict[str, Dict[str, float]]:
        """Analyze divisional charts for events."""
        correlations = {}
        
        for event in events:
            event_charts = {}
            relevant_charts = self.divisional_mappings.get(event['type'], [])
            
            for chart in relevant_charts:
                chart_positions = self.planetary_calculator.calculate_divisional_positions(
                    birth_data,
                    chart,
                    base_positions
                )
                correlation = self._calculate_chart_correlation(
                    chart_positions,
                    event['type'],
                    event['intensity']
                )
                event_charts[chart] = correlation
            
            correlations[event['id']] = event_charts
        
        return correlations
    
    def _analyze_time_periods(
        self,
        birth_data: BirthData,
        events: List[Dict[str, Any]]
    ) -> Dict[str, Dict[str, Any]]:
        """Analyze multiple time periods."""
        periods = {}
        
        # Group events by year
        events_by_year = {}
        for event in events:
            year = event['time'].year
            if year not in events_by_year:
                events_by_year[year] = []
            events_by_year[year].append(event)
        
        # Analyze each period
        for year, year_events in events_by_year.items():
            period_data = {
                'event_count': len(year_events),
                'event_types': list(set(e['type'] for e in year_events)),
                'intensity': np.mean([e['intensity'] for e in year_events]),
                'planetary_influences': self._calculate_planetary_influences(birth_data, year)
            }
            periods[str(year)] = period_data
        
        return periods
    
    def _correlate_events(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze correlations between multiple events."""
        correlations = []
        
        for i, event1 in enumerate(events):
            for j, event2 in enumerate(events[i+1:], i+1):
                correlation = self._calculate_event_correlation(event1, event2)
                if correlation['strength'] > 0.3:  # Only include significant correlations
                    correlations.append(correlation)
        
        return correlations
    
    def _detect_ml_patterns(
        self,
        events: List[Dict[str, Any]],
        base_positions: Dict[str, float]
    ) -> Dict[str, Any]:
        """Detect patterns using machine learning."""
        # Prepare data for ML
        features = self._prepare_ml_features(events, base_positions)
        scaler = StandardScaler()
        scaled_features = scaler.fit_transform(features)
        
        # Cluster analysis
        kmeans = KMeans(n_clusters=min(3, len(events)))
        clusters = kmeans.fit_predict(scaled_features)
        
        # Sequence analysis
        sequences = self._analyze_event_sequences(events)
        
        # Anomaly detection
        anomalies = self._detect_anomalies(scaled_features)
        
        # Trend analysis
        trends = self._analyze_trends(events)
        
        return {
            'clusters': self._format_clusters(events, clusters),
            'sequences': sequences,
            'anomalies': anomalies,
            'trends': trends
        }
    
    def _calculate_confidence_scores(
        self,
        patterns: Dict[str, Any],
        dasha_correlations: Dict[str, Dict[str, Any]],
        divisional_correlations: Dict[str, Dict[str, float]],
        period_analysis: Dict[str, Dict[str, Any]],
        event_correlations: List[Dict[str, Any]],
        ml_patterns: Dict[str, Any]
    ) -> Dict[str, float]:
        """Calculate confidence scores for all analyses."""
        pattern_confidence = self._calculate_pattern_confidence(patterns)
        dasha_confidence = np.mean([c['correlation_score'] for c in dasha_correlations.values()])
        divisional_confidence = np.mean([
            np.mean(list(charts.values()))
            for charts in divisional_correlations.values()
        ])
        period_confidence = np.mean([p['intensity'] for p in period_analysis.values()])
        correlation_confidence = np.mean([c['strength'] for c in event_correlations])
        ml_confidence = self._calculate_ml_confidence(ml_patterns)
        
        overall_confidence = np.mean([
            pattern_confidence,
            dasha_confidence,
            divisional_confidence,
            period_confidence,
            correlation_confidence,
            ml_confidence
        ])
        
        return {
            'overall': overall_confidence,
            'pattern_confidence': pattern_confidence,
            'dasha_confidence': dasha_confidence,
            'divisional_confidence': divisional_confidence,
            'period_confidence': period_confidence,
            'correlation_confidence': correlation_confidence,
            'ml_confidence': ml_confidence
        }
    
    def _validate_events(self, events: List[Dict[str, Any]]) -> bool:
        """Validate event data structure."""
        required_fields = {'id', 'type', 'time', 'description', 'intensity'}
        return all(
            all(field in event for field in required_fields)
            for event in events
        )
    
    def _get_fallback_analysis(self) -> Dict[str, Any]:
        """Return fallback analysis when errors occur."""
        return {
            'patterns': {},
            'confidence_scores': {
                'overall': 0.5,
                'pattern_confidence': 0.5,
                'dasha_confidence': 0.5,
                'divisional_confidence': 0.5,
                'period_confidence': 0.5,
                'correlation_confidence': 0.5,
                'ml_confidence': 0.5
            }
        }
    
    # Helper methods for pattern analysis
    def _analyze_timing_patterns(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze timing patterns in events."""
        patterns = []
        
        # Sort events by time
        sorted_events = sorted(events, key=lambda x: x['time'])
        
        # Calculate time differences between consecutive events
        for i in range(len(sorted_events) - 1):
            time_diff = sorted_events[i + 1]['time'] - sorted_events[i]['time']
            pattern = {
                'event1': sorted_events[i]['id'],
                'event2': sorted_events[i + 1]['id'],
                'time_difference': time_diff.total_seconds() / (24 * 3600),  # Convert to days
                'type': 'timing'
            }
            patterns.append(pattern)
        
        return patterns
    
    def _analyze_type_patterns(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze patterns in event types."""
        patterns = []
        type_counts = {}
        
        # Count event types
        for event in events:
            event_type = event['type']
            type_counts[event_type] = type_counts.get(event_type, 0) + 1
        
        # Create patterns for frequent event types
        for event_type, count in type_counts.items():
            if count > 1:
                pattern = {
                    'type': 'event_type',
                    'event_type': event_type,
                    'frequency': count,
                    'percentage': count / len(events)
                }
                patterns.append(pattern)
        
        return patterns
    
    def _analyze_intensity_patterns(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze patterns in event intensities."""
        patterns = []
        
        # Calculate average intensity by event type
        type_intensities = {}
        type_counts = {}
        
        for event in events:
            event_type = event['type']
            intensity = event['intensity']
            
            if event_type not in type_intensities:
                type_intensities[event_type] = 0
                type_counts[event_type] = 0
            
            type_intensities[event_type] += intensity
            type_counts[event_type] += 1
        
        # Create patterns for average intensities
        for event_type in type_intensities:
            avg_intensity = type_intensities[event_type] / type_counts[event_type]
            pattern = {
                'type': 'intensity',
                'event_type': event_type,
                'average_intensity': avg_intensity
            }
            patterns.append(pattern)
        
        return patterns
    
    def _analyze_cyclical_patterns(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze cyclical patterns in events."""
        patterns = []
        
        # Group events by month
        month_counts = {}
        for event in events:
            month = event['time'].month
            month_counts[month] = month_counts.get(month, 0) + 1
        
        # Identify months with higher event frequency
        avg_count = sum(month_counts.values()) / len(month_counts)
        for month, count in month_counts.items():
            if count > avg_count:
                pattern = {
                    'type': 'cyclical',
                    'month': month,
                    'frequency': count,
                    'relative_frequency': count / avg_count
                }
                patterns.append(pattern)
        
        return patterns
    
    def _calculate_dasha_correlation(
        self,
        dasha_details: Dict[str, str],
        event_type: str,
        intensity: float
    ) -> float:
        """Calculate correlation between dasha and event."""
        # Simplified correlation calculation
        # In a real implementation, this would use more sophisticated astrological rules
        correlation_score = 0.75  # Default correlation
        
        # Adjust based on event type and dasha lords
        if event_type in ['career', 'education'] and 'Jupiter' in dasha_details['maha_dasha']:
            correlation_score += 0.1
        elif event_type == 'relationship' and 'Venus' in dasha_details['maha_dasha']:
            correlation_score += 0.1
        
        return min(correlation_score, 1.0)
    
    def _calculate_chart_correlation(
        self,
        chart_positions: Dict[str, float],
        event_type: str,
        intensity: float
    ) -> float:
        """Calculate correlation between divisional chart and event."""
        # Simplified correlation calculation
        # In a real implementation, this would use more sophisticated astrological rules
        base_correlation = 0.7
        
        # Adjust based on planetary positions
        if 'Jupiter' in chart_positions and chart_positions['Jupiter'] < 30:
            base_correlation += 0.1
        
        return min(base_correlation + (intensity * 0.1), 1.0)
    
    def _calculate_planetary_influences(
        self,
        birth_data: BirthData,
        year: int
    ) -> Dict[str, float]:
        """Calculate planetary influences for a given year."""
        # Simplified calculation
        # In a real implementation, this would calculate actual transits
        return {
            'Sun': 0.7,
            'Moon': 0.6,
            'Mars': 0.5,
            'Mercury': 0.6,
            'Jupiter': 0.8,
            'Venus': 0.7,
            'Saturn': 0.6
        }
    
    def _calculate_event_correlation(
        self,
        event1: Dict[str, Any],
        event2: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate correlation between two events."""
        time_diff = abs((event2['time'] - event1['time']).total_seconds() / (24 * 3600))
        type_match = event1['type'] == event2['type']
        intensity_diff = abs(event1['intensity'] - event2['intensity'])
        
        # Calculate correlation strength
        strength = 0.5
        if type_match:
            strength += 0.2
        if time_diff < 365:  # Events within a year
            strength += 0.2
        if intensity_diff < 0.2:
            strength += 0.1
        
        return {
            'event1': event1['id'],
            'event2': event2['id'],
            'strength': strength,
            'type': 'sequential' if event1['time'] < event2['time'] else 'reverse'
        }
    
    def _prepare_ml_features(
        self,
        events: List[Dict[str, Any]],
        base_positions: Dict[str, float]
    ) -> np.ndarray:
        """Prepare features for ML analysis."""
        features = []
        
        for event in events:
            # Convert event data to numerical features
            event_features = [
                event['time'].timestamp(),  # Time as Unix timestamp
                float(event['intensity']),
                len(event['description']),
                hash(event['type']) % 100  # Simple type encoding
            ]
            features.append(event_features)
        
        return np.array(features)
    
    def _analyze_event_sequences(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze sequences in events."""
        sequences = []
        sorted_events = sorted(events, key=lambda x: x['time'])
        
        # Look for sequences of 3 or more events
        for i in range(len(sorted_events) - 2):
            sequence = sorted_events[i:i+3]
            if all(s['type'] == sequence[0]['type'] for s in sequence):
                sequences.append({
                    'type': 'same_type_sequence',
                    'events': [e['id'] for e in sequence],
                    'event_type': sequence[0]['type']
                })
        
        return sequences
    
    def _detect_anomalies(self, features: np.ndarray) -> List[Dict[str, Any]]:
        """Detect anomalies in event patterns."""
        anomalies = []
        
        # Simple anomaly detection based on feature distances
        mean_features = np.mean(features, axis=0)
        distances = np.linalg.norm(features - mean_features, axis=1)
        threshold = np.mean(distances) + 2 * np.std(distances)
        
        anomaly_indices = np.where(distances > threshold)[0]
        for idx in anomaly_indices:
            anomalies.append({
                'index': int(idx),
                'distance': float(distances[idx]),
                'threshold': float(threshold)
            })
        
        return anomalies
    
    def _analyze_trends(self, events: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze trends in events."""
        sorted_events = sorted(events, key=lambda x: x['time'])
        
        # Calculate intensity trend
        intensities = [e['intensity'] for e in sorted_events]
        intensity_trend = np.polyfit(range(len(intensities)), intensities, 1)[0]
        
        # Calculate type frequency changes
        type_frequencies = {}
        mid_point = len(events) // 2
        
        first_half = sorted_events[:mid_point]
        second_half = sorted_events[mid_point:]
        
        for event_type in set(e['type'] for e in events):
            first_count = sum(1 for e in first_half if e['type'] == event_type)
            second_count = sum(1 for e in second_half if e['type'] == event_type)
            type_frequencies[event_type] = second_count - first_count
        
        return {
            'intensity_trend': float(intensity_trend),
            'type_frequency_changes': type_frequencies
        }
    
    def _format_clusters(
        self,
        events: List[Dict[str, Any]],
        clusters: np.ndarray
    ) -> List[Dict[str, Any]]:
        """Format clustering results."""
        formatted_clusters = []
        
        for cluster_id in range(max(clusters) + 1):
            cluster_events = [
                events[i]['id']
                for i in range(len(events))
                if clusters[i] == cluster_id
            ]
            
            if cluster_events:
                formatted_clusters.append({
                    'cluster_id': int(cluster_id),
                    'events': cluster_events,
                    'size': len(cluster_events)
                })
        
        return formatted_clusters
    
    def _calculate_pattern_confidence(self, patterns: Dict[str, Any]) -> float:
        """Calculate confidence score for pattern analysis."""
        confidences = []
        
        if patterns.get('timing_patterns'):
            confidences.append(0.8)
        if patterns.get('type_patterns'):
            confidences.append(0.7)
        if patterns.get('intensity_patterns'):
            confidences.append(0.75)
        if patterns.get('cyclical_patterns'):
            confidences.append(0.85)
        
        return np.mean(confidences) if confidences else 0.5
    
    def _calculate_ml_confidence(self, ml_patterns: Dict[str, Any]) -> float:
        """Calculate confidence score for ML patterns."""
        confidences = []
        
        if ml_patterns.get('clusters'):
            confidences.append(0.7)
        if ml_patterns.get('sequences'):
            confidences.append(0.75)
        if ml_patterns.get('anomalies'):
            confidences.append(0.8)
        if ml_patterns.get('trends'):
            confidences.append(0.7)
        
        return np.mean(confidences) if confidences else 0.5 