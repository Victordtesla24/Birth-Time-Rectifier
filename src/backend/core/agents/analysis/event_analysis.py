"""
Enhanced Event Analysis Module
Handles sophisticated event pattern recognition and correlation.
"""

from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
import numpy as np
from ..models.birth_data import BirthData
from ..astronomy.planetary_positions import PlanetaryPositionsCalculator
from ..charts.divisional_charts import DivisionalChartsCalculator
from ..core.dasha_calculator import DashaCalculator

class EventAnalyzer:
    """Enhanced event analysis with pattern recognition and correlation."""
    
    def __init__(self):
        """Initialize event analyzer."""
        self.planetary_calculator = PlanetaryPositionsCalculator()
        self.divisional_calculator = DivisionalChartsCalculator()
        self.dasha_calculator = DashaCalculator()
        
        # Event type weights for correlation
        self.event_weights = {
            'career': 0.8,
            'relationship': 0.8,
            'health': 0.9,
            'spiritual': 0.7,
            'education': 0.7,
            'relocation': 0.6
        }
        
        # Divisional chart mappings
        self.divisional_mappings = {
            'career': ['D10', 'D24'],
            'relationship': ['D7', 'D9'],
            'health': ['D30'],
            'spiritual': ['D20', 'D60'],
            'education': ['D24'],
            'relocation': ['D4', 'D12']
        }
        
        # Advanced dasha period weights
        self.dasha_weights = {
            'mahadasha': 0.4,
            'antardasha': 0.3,
            'pratyantar': 0.2,
            'sookshma': 0.1
        }
        
        # Time period analysis windows
        self.time_windows = {
            'short_term': {'years': 1},
            'medium_term': {'years': 5},
            'long_term': {'years': 10}
        }
        
        # Divisional chart significance weights
        self.divisional_weights = {
            'D1': 0.3,  # Rashi chart
            'D9': 0.2,  # Navamsa
            'D10': 0.15,  # Dasamsa
            'D60': 0.1,  # Shastiamsa
            'custom': 0.25  # Event-specific divisional charts
        }
    
    def analyze_events(
        self,
        birth_data: BirthData,
        events: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Perform comprehensive event analysis."""
        try:
            # Calculate base positions
            base_positions = self.planetary_calculator.calculate_positions(birth_data)
            
            # Analyze patterns
            patterns = self._analyze_event_patterns(events)
            
            # Calculate dasha correlations
            dasha_correlations = self._analyze_dasha_periods(birth_data, events)
            
            # Analyze divisional charts
            divisional_correlations = self._analyze_divisional_charts(
                birth_data,
                events,
                base_positions
            )
            
            # Analyze multiple time periods
            period_analysis = self._analyze_time_periods(birth_data, events)
            
            # Calculate event correlations
            event_correlations = self._correlate_events(events)
            
            # ML pattern detection
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
            logger.error(f"Error in event analysis: {str(e)}")
            return self._generate_fallback_analysis()
    
    def _analyze_event_patterns(
        self,
        events: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze sophisticated event patterns."""
        patterns = {
            'timing_patterns': self._analyze_timing_patterns(events),
            'type_patterns': self._analyze_type_patterns(events),
            'intensity_patterns': self._analyze_intensity_patterns(events),
            'cyclical_patterns': self._analyze_cyclical_patterns(events)
        }
        
        return patterns
    
    def _analyze_dasha_periods(
        self,
        birth_data: BirthData,
        events: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze dasha-based event correlations."""
        correlations = {}
        
        for event in events:
            event_time = event['time']
            
            # Calculate dasha periods
            maha_dasha = self.dasha_calculator.calculate_maha_dasha(birth_data, event_time)
            antar_dasha = self.dasha_calculator.calculate_antar_dasha(birth_data, event_time)
            pratyantar_dasha = self.dasha_calculator.calculate_pratyantar_dasha(birth_data, event_time)
            
            # Calculate correlation scores
            correlation = self._calculate_dasha_correlation(
                event,
                maha_dasha,
                antar_dasha,
                pratyantar_dasha
            )
            
            correlations[event['id']] = {
                'maha_dasha': maha_dasha,
                'antar_dasha': antar_dasha,
                'pratyantar_dasha': pratyantar_dasha,
                'correlation_score': correlation
            }
        
        return correlations
    
    def _analyze_divisional_charts(
        self,
        birth_data: BirthData,
        events: List[Dict[str, Any]],
        base_positions: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze events using divisional charts."""
        correlations = {}
        
        for event in events:
            event_type = event['type']
            relevant_charts = self.divisional_mappings.get(event_type, [])
            
            chart_correlations = {}
            for chart_type in relevant_charts:
                # Calculate divisional chart
                chart = self.divisional_calculator.calculate_chart(
                    birth_data,
                    chart_type,
                    base_positions
                )
                
                # Calculate correlation
                correlation = self._calculate_chart_correlation(
                    event,
                    chart,
                    chart_type
                )
                
                chart_correlations[chart_type] = correlation
            
            correlations[event['id']] = chart_correlations
        
        return correlations
    
    def _analyze_time_periods(
        self,
        birth_data: BirthData,
        events: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze multiple time periods."""
        # Group events by time periods
        periods = self._group_events_by_period(events)
        
        # Analyze each period
        period_analysis = {}
        for period, period_events in periods.items():
            period_analysis[period] = {
                'event_count': len(period_events),
                'event_types': self._analyze_period_event_types(period_events),
                'intensity': self._calculate_period_intensity(period_events),
                'planetary_influences': self._analyze_period_planets(
                    birth_data,
                    period,
                    period_events
                )
            }
        
        return period_analysis
    
    def _correlate_events(
        self,
        events: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Analyze correlations between multiple events."""
        correlations = []
        
        # Compare each event pair
        for i, event1 in enumerate(events):
            for j, event2 in enumerate(events[i+1:], i+1):
                correlation = self._calculate_event_pair_correlation(event1, event2)
                if correlation['strength'] > 0.5:  # Only include significant correlations
                    correlations.append(correlation)
        
        return correlations
    
    def _detect_ml_patterns(
        self,
        events: List[Dict[str, Any]],
        base_positions: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Detect patterns using ML techniques."""
        # Convert events to feature vectors
        features = self._extract_event_features(events, base_positions)
        
        # Detect patterns
        patterns = {
            'clusters': self._cluster_events(features),
            'sequences': self._detect_sequences(features),
            'anomalies': self._detect_anomalies(features),
            'trends': self._analyze_trends(features)
        }
        
        return patterns
    
    def _calculate_confidence_scores(
        self,
        patterns: Dict[str, Any],
        dasha_correlations: Dict[str, Any],
        divisional_correlations: Dict[str, Any],
        period_analysis: Dict[str, Any],
        event_correlations: List[Dict[str, Any]],
        ml_patterns: Dict[str, Any]
    ) -> Dict[str, float]:
        """Calculate confidence scores for event correlations."""
        scores = {}
        
        # Calculate pattern confidence
        pattern_confidence = self._calculate_pattern_confidence(patterns)
        
        # Calculate dasha confidence
        dasha_confidence = self._calculate_dasha_confidence(dasha_correlations)
        
        # Calculate divisional chart confidence
        divisional_confidence = self._calculate_divisional_confidence(divisional_correlations)
        
        # Calculate period analysis confidence
        period_confidence = self._calculate_period_confidence(period_analysis)
        
        # Calculate event correlation confidence
        correlation_confidence = self._calculate_correlation_confidence(event_correlations)
        
        # Calculate ML pattern confidence
        ml_confidence = self._calculate_ml_confidence(ml_patterns)
        
        # Combine scores with weights
        scores = {
            'overall': np.mean([
                pattern_confidence * 0.2,
                dasha_confidence * 0.25,
                divisional_confidence * 0.15,
                period_confidence * 0.15,
                correlation_confidence * 0.15,
                ml_confidence * 0.1
            ]),
            'pattern_confidence': pattern_confidence,
            'dasha_confidence': dasha_confidence,
            'divisional_confidence': divisional_confidence,
            'period_confidence': period_confidence,
            'correlation_confidence': correlation_confidence,
            'ml_confidence': ml_confidence
        }
        
        return scores
    
    def _calculate_pattern_confidence(self, patterns: Dict[str, Any]) -> float:
        """Calculate confidence score for pattern analysis."""
        # Implementation of pattern confidence calculation
        return 0.8  # Placeholder
    
    def _calculate_dasha_confidence(self, correlations: Dict[str, Any]) -> float:
        """Calculate confidence score for dasha correlations."""
        # Implementation of dasha confidence calculation
        return 0.8  # Placeholder
    
    def _calculate_divisional_confidence(self, correlations: Dict[str, Any]) -> float:
        """Calculate confidence score for divisional chart analysis."""
        # Implementation of divisional confidence calculation
        return 0.8  # Placeholder
    
    def _calculate_period_confidence(self, analysis: Dict[str, Any]) -> float:
        """Calculate confidence score for period analysis."""
        # Implementation of period confidence calculation
        return 0.8  # Placeholder
    
    def _calculate_correlation_confidence(self, correlations: List[Dict[str, Any]]) -> float:
        """Calculate confidence score for event correlations."""
        # Implementation of correlation confidence calculation
        return 0.8  # Placeholder
    
    def _calculate_ml_confidence(self, patterns: Dict[str, Any]) -> float:
        """Calculate confidence score for ML patterns."""
        # Implementation of ML confidence calculation
        return 0.8  # Placeholder
    
    def _generate_fallback_analysis(self) -> Dict[str, Any]:
        """Generate fallback analysis when main analysis fails."""
        return {
            'patterns': {},
            'dasha_correlations': {},
            'divisional_correlations': {},
            'period_analysis': {},
            'event_correlations': [],
            'ml_patterns': {},
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
    
    def analyze_dasha_correlations(
        self, 
        birth_data: BirthData,
        events: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze events using advanced dasha-based correlation."""
        correlations = {
            'overall_score': 0.0,
            'dasha_periods': [],
            'time_windows': {},
            'divisional_analysis': {}
        }
        
        # Calculate dasha periods for all levels
        dasha_periods = self.dasha_calculator.calculate_detailed_dashas(birth_data)
        
        # Analyze each event across different time windows
        for event in events:
            event_time = datetime.fromisoformat(event['timestamp'])
            event_type = event['type']
            
            # 1. Analyze dasha period correlations
            dasha_correlation = self._analyze_dasha_period_correlation(
                event_time, dasha_periods, event_type
            )
            correlations['dasha_periods'].append({
                'event': event,
                'correlation': dasha_correlation
            })
            
            # 2. Analyze time windows around the event
            window_correlations = self._analyze_time_windows(
                birth_data, event_time, event_type
            )
            correlations['time_windows'][event['id']] = window_correlations
            
            # 3. Analyze relevant divisional charts
            divisional_correlation = self._analyze_divisional_charts(
                birth_data, event_time, event_type
            )
            correlations['divisional_analysis'][event['id']] = divisional_correlation
        
        # Calculate overall correlation score
        correlations['overall_score'] = self._calculate_overall_correlation(correlations)
        
        return correlations
    
    def _analyze_dasha_period_correlation(
        self,
        event_time: datetime,
        dasha_periods: Dict[str, Any],
        event_type: str
    ) -> Dict[str, Any]:
        """Analyze correlation between event and dasha periods at all levels."""
        correlation = {
            'score': 0.0,
            'active_periods': {},
            'strength_factors': {}
        }
        
        # Get active periods at each level
        for level, weight in self.dasha_weights.items():
            active_period = self._get_active_period(event_time, dasha_periods[level])
            if active_period:
                # Calculate period strength
                strength = self._calculate_period_strength(
                    active_period, event_type
                )
                correlation['active_periods'][level] = active_period
                correlation['strength_factors'][level] = strength
                correlation['score'] += strength * weight
        
        return correlation
    
    def _analyze_time_windows(
        self,
        birth_data: BirthData,
        event_time: datetime,
        event_type: str
    ) -> Dict[str, Any]:
        """Analyze planetary patterns in different time windows around the event."""
        window_analysis = {}
        
        for window_name, duration in self.time_windows.items():
            # Calculate positions for the time window
            start_time = event_time - timedelta(**duration)
            end_time = event_time + timedelta(**duration)
            
            # Analyze planetary positions and patterns
            window_analysis[window_name] = {
                'planetary_patterns': self._analyze_planetary_patterns(
                    birth_data, start_time, end_time
                ),
                'transit_impacts': self._analyze_transit_impacts(
                    birth_data, start_time, end_time, event_type
                )
            }
        
        return window_analysis
    
    def _analyze_divisional_charts(
        self,
        birth_data: BirthData,
        event_time: datetime,
        event_type: str
    ) -> Dict[str, Any]:
        """Analyze event correlation in relevant divisional charts."""
        analysis = {
            'score': 0.0,
            'charts': {}
        }
        
        # Get relevant divisional charts for the event type
        relevant_charts = self.divisional_mappings.get(event_type, ['D1'])
        
        for chart in relevant_charts:
            # Calculate divisional chart positions
            chart_positions = self.divisional_calculator.calculate_chart(
                birth_data, chart
            )
            
            # Analyze significance in the divisional chart
            significance = self._analyze_chart_significance(
                chart_positions, event_time, event_type
            )
            
            analysis['charts'][chart] = {
                'positions': chart_positions,
                'significance': significance
            }
            
            # Add weighted contribution to overall score
            weight = self.divisional_weights.get(chart, self.divisional_weights['custom'])
            analysis['score'] += significance * weight
        
        return analysis
    
    def _calculate_overall_correlation(self, correlations: Dict[str, Any]) -> float:
        """Calculate overall correlation score from all components."""
        scores = []
        
        # 1. Dasha period correlations (40%)
        if correlations['dasha_periods']:
            dasha_score = sum(p['correlation']['score'] 
                            for p in correlations['dasha_periods'])
            dasha_score /= len(correlations['dasha_periods'])
            scores.append(('dasha', dasha_score, 0.4))
        
        # 2. Time window analysis (30%)
        if correlations['time_windows']:
            window_scores = []
            for window_analysis in correlations['time_windows'].values():
                window_score = sum(
                    w['planetary_patterns']['strength'] + w['transit_impacts']['strength']
                    for w in window_analysis.values()
                ) / (2 * len(window_analysis))
                window_scores.append(window_score)
            avg_window_score = sum(window_scores) / len(window_scores)
            scores.append(('windows', avg_window_score, 0.3))
        
        # 3. Divisional chart analysis (30%)
        if correlations['divisional_analysis']:
            div_scores = [a['score'] for a in correlations['divisional_analysis'].values()]
            avg_div_score = sum(div_scores) / len(div_scores)
            scores.append(('divisional', avg_div_score, 0.3))
        
        # Calculate weighted average
        if scores:
            total_weight = sum(weight for _, _, weight in scores)
            weighted_sum = sum(score * weight for _, score, weight in scores)
            return weighted_sum / total_weight
        
        return 0.0 