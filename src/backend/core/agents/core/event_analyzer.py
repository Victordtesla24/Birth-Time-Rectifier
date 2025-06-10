from typing import Dict, Any, List, Optional
import numpy as np
from datetime import datetime
import logging
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from ..models.birth_data import BirthData

logger = logging.getLogger(__name__)

class EventAnalyzer:
    """Advanced event analysis and correlation engine."""
    
    def __init__(self):
        """Initialize the event analyzer."""
        self.scaler = StandardScaler()
        self.clustering = DBSCAN(eps=0.5, min_samples=2)
        self.confidence_history = []
        self.pattern_cache = {}
        
    def analyze_events(
        self,
        birth_data: BirthData,
        events: List[Dict[str, Any]],
        time_periods: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Analyze events using multiple approaches."""
        try:
            # Perform time-period analysis
            period_analysis = self._analyze_time_periods(events, time_periods)
            
            # Detect patterns using ML
            patterns = self._detect_patterns(events)
            
            # Calculate correlations and confidence
            correlations = self._calculate_correlations(birth_data, events, patterns)
            
            # Combine results
            analysis_results = {
                "period_analysis": period_analysis,
                "patterns": patterns,
                "correlations": correlations,
                "confidence_scores": self._calculate_confidence_scores(
                    period_analysis,
                    patterns,
                    correlations
                )
            }
            
            # Cache results for future reference
            self._update_pattern_cache(analysis_results)
            
            return analysis_results
            
        except Exception as e:
            logger.error(f"Error analyzing events: {str(e)}")
            return self._generate_fallback_analysis()
            
    def _analyze_time_periods(
        self,
        events: List[Dict[str, Any]],
        time_periods: Optional[List[Dict[str, Any]]]
    ) -> Dict[str, Any]:
        """Analyze events across different time periods."""
        if not time_periods:
            # Generate default time periods if none provided
            time_periods = self._generate_default_periods(events)
            
        period_analysis = {}
        
        for period in time_periods:
            # Filter events for this period
            period_events = self._filter_events_by_period(events, period)
            
            # Analyze event density
            density = self._calculate_event_density(period_events, period)
            
            # Analyze event types distribution
            type_distribution = self._analyze_type_distribution(period_events)
            
            # Calculate period significance
            significance = self._calculate_period_significance(
                density,
                type_distribution,
                period
            )
            
            period_analysis[period["name"]] = {
                "events": len(period_events),
                "density": density,
                "type_distribution": type_distribution,
                "significance": significance
            }
            
        return period_analysis
        
    def _detect_patterns(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Detect patterns in events using ML techniques."""
        if not events:
            return []
            
        patterns = []
        
        # Prepare event data for clustering
        event_features = self._extract_event_features(events)
        if not event_features:
            return patterns
            
        # Scale features
        scaled_features = self.scaler.fit_transform(event_features)
        
        # Perform clustering
        clusters = self.clustering.fit_predict(scaled_features)
        
        # Analyze each cluster
        unique_clusters = np.unique(clusters)
        for cluster_id in unique_clusters:
            if cluster_id == -1:  # Noise points in DBSCAN
                continue
                
            cluster_events = [
                events[i] for i in range(len(events))
                if clusters[i] == cluster_id
            ]
            
            # Analyze cluster characteristics
            pattern = self._analyze_cluster(cluster_events)
            if pattern:
                patterns.append(pattern)
                
        return patterns
        
    def _calculate_correlations(
        self,
        birth_data: BirthData,
        events: List[Dict[str, Any]],
        patterns: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Calculate correlations between events and patterns."""
        correlations = {
            "event_correlations": self._correlate_events(events),
            "pattern_correlations": self._correlate_patterns(patterns),
            "time_correlations": self._correlate_with_birth_time(birth_data, events)
        }
        
        # Calculate overall correlation strength
        correlations["overall_strength"] = np.mean([
            np.mean(list(correlations["event_correlations"].values())),
            np.mean(list(correlations["pattern_correlations"].values())),
            correlations["time_correlations"]["strength"]
        ])
        
        return correlations
        
    def _calculate_confidence_scores(
        self,
        period_analysis: Dict[str, Any],
        patterns: List[Dict[str, Any]],
        correlations: Dict[str, Any]
    ) -> Dict[str, float]:
        """Calculate confidence scores for different aspects of analysis."""
        confidence_scores = {
            "period_confidence": self._calculate_period_confidence(period_analysis),
            "pattern_confidence": self._calculate_pattern_confidence(patterns),
            "correlation_confidence": correlations["overall_strength"]
        }
        
        # Calculate overall confidence
        weights = {
            "period_confidence": 0.3,
            "pattern_confidence": 0.4,
            "correlation_confidence": 0.3
        }
        
        confidence_scores["overall"] = sum(
            score * weights[metric]
            for metric, score in confidence_scores.items()
            if metric != "overall"
        )
        
        return confidence_scores
        
    def _generate_default_periods(
        self,
        events: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Generate default time periods for analysis."""
        if not events:
            return []
            
        # Sort events by time
        sorted_events = sorted(events, key=lambda x: x["time"])
        
        # Calculate total time span
        start_time = sorted_events[0]["time"]
        end_time = sorted_events[-1]["time"]
        total_span = (end_time - start_time).days
        
        # Create periods (e.g., yearly)
        periods = []
        current_start = start_time
        while current_start < end_time:
            current_end = min(
                current_start.replace(year=current_start.year + 1),
                end_time
            )
            
            periods.append({
                "name": f"Period_{len(periods) + 1}",
                "start": current_start,
                "end": current_end
            })
            
            current_start = current_end
            
        return periods
        
    def _filter_events_by_period(
        self,
        events: List[Dict[str, Any]],
        period: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Filter events that fall within a specific time period."""
        return [
            event for event in events
            if period["start"] <= event["time"] <= period["end"]
        ]
        
    def _calculate_event_density(
        self,
        events: List[Dict[str, Any]],
        period: Dict[str, Any]
    ) -> float:
        """Calculate event density within a time period."""
        period_length = (period["end"] - period["start"]).days
        if period_length == 0:
            return 0.0
            
        return len(events) / period_length
        
    def _analyze_type_distribution(
        self,
        events: List[Dict[str, Any]]
    ) -> Dict[str, float]:
        """Analyze distribution of event types."""
        if not events:
            return {}
            
        type_counts = {}
        for event in events:
            event_type = event.get("type", "unknown")
            type_counts[event_type] = type_counts.get(event_type, 0) + 1
            
        total_events = len(events)
        return {
            event_type: count / total_events
            for event_type, count in type_counts.items()
        }
        
    def _calculate_period_significance(
        self,
        density: float,
        type_distribution: Dict[str, float],
        period: Dict[str, Any]
    ) -> float:
        """Calculate significance score for a time period."""
        # Consider multiple factors for significance
        significance_factors = [
            density,  # Event density
            len(type_distribution),  # Variety of event types
            max(type_distribution.values()) if type_distribution else 0  # Peak concentration
        ]
        
        return np.mean(significance_factors)
        
    def _extract_event_features(
        self,
        events: List[Dict[str, Any]]
    ) -> Optional[np.ndarray]:
        """Extract numerical features from events for ML analysis."""
        if not events:
            return None
            
        features = []
        for event in events:
            # Convert timestamp to numerical features
            event_time = event["time"]
            features.append([
                event_time.year,
                event_time.month,
                event_time.day,
                event_time.hour,
                event_time.minute,
                self._encode_event_type(event.get("type", "unknown")),
                event.get("significance", 0.5)
            ])
            
        return np.array(features)
        
    def _encode_event_type(self, event_type: str) -> float:
        """Encode event type as a numerical value."""
        type_encoding = {
            "career": 1.0,
            "relationship": 2.0,
            "education": 3.0,
            "health": 4.0,
            "spirituality": 5.0,
            "unknown": 0.0
        }
        return type_encoding.get(event_type.lower(), 0.0)
        
    def _analyze_cluster(
        self,
        cluster_events: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """Analyze characteristics of an event cluster."""
        if not cluster_events:
            return None
            
        # Calculate cluster timespan
        event_times = [event["time"] for event in cluster_events]
        start_time = min(event_times)
        end_time = max(event_times)
        
        # Analyze event types in cluster
        type_distribution = self._analyze_type_distribution(cluster_events)
        
        # Determine dominant type
        dominant_type = max(
            type_distribution.items(),
            key=lambda x: x[1]
        )[0] if type_distribution else "unknown"
        
        return {
            "type": "temporal_cluster",
            "start_time": start_time,
            "end_time": end_time,
            "event_count": len(cluster_events),
            "dominant_type": dominant_type,
            "type_distribution": type_distribution,
            "significance": self._calculate_cluster_significance(
                cluster_events,
                type_distribution
            )
        }
        
    def _calculate_cluster_significance(
        self,
        cluster_events: List[Dict[str, Any]],
        type_distribution: Dict[str, float]
    ) -> float:
        """Calculate significance score for an event cluster."""
        if not cluster_events:
            return 0.0
            
        # Consider multiple factors
        factors = [
            len(cluster_events) / 10,  # Size factor (normalized)
            len(type_distribution) / 5,  # Type variety factor
            max(type_distribution.values()),  # Type concentration factor
            np.mean([event.get("significance", 0.5) for event in cluster_events])  # Event significance factor
        ]
        
        return np.mean(factors)
        
    def _correlate_events(
        self,
        events: List[Dict[str, Any]]
    ) -> Dict[str, float]:
        """Calculate correlations between events."""
        correlations = {}
        
        for i, event1 in enumerate(events):
            for j, event2 in enumerate(events[i+1:], i+1):
                correlation_key = f"{event1['id']}_{event2['id']}"
                correlations[correlation_key] = self._calculate_event_correlation(
                    event1,
                    event2
                )
                
        return correlations
        
    def _correlate_patterns(
        self,
        patterns: List[Dict[str, Any]]
    ) -> Dict[str, float]:
        """Calculate correlations between patterns."""
        correlations = {}
        
        for i, pattern1 in enumerate(patterns):
            for j, pattern2 in enumerate(patterns[i+1:], i+1):
                correlation_key = f"{i}_{j}"
                correlations[correlation_key] = self._calculate_pattern_correlation(
                    pattern1,
                    pattern2
                )
                
        return correlations
        
    def _correlate_with_birth_time(
        self,
        birth_data: BirthData,
        events: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Calculate correlations between events and birth time."""
        birth_time = datetime.combine(birth_data.date, birth_data.time)
        
        # Calculate temporal distances
        temporal_distances = [
            abs((event["time"] - birth_time).total_seconds())
            for event in events
        ]
        
        # Normalize distances
        max_distance = max(temporal_distances) if temporal_distances else 1
        normalized_distances = [d / max_distance for d in temporal_distances]
        
        # Calculate correlation strength
        strength = 1 - np.mean(normalized_distances)
        
        return {
            "strength": strength,
            "event_distances": dict(
                zip([e["id"] for e in events], normalized_distances)
            )
        }
        
    def _calculate_event_correlation(
        self,
        event1: Dict[str, Any],
        event2: Dict[str, Any]
    ) -> float:
        """Calculate correlation between two events."""
        # Consider multiple factors
        time_correlation = self._calculate_time_correlation(
            event1["time"],
            event2["time"]
        )
        
        type_correlation = float(
            event1.get("type") == event2.get("type")
        )
        
        significance_correlation = 1 - abs(
            event1.get("significance", 0.5) - event2.get("significance", 0.5)
        )
        
        # Weighted combination
        weights = {
            "time": 0.4,
            "type": 0.3,
            "significance": 0.3
        }
        
        return (
            time_correlation * weights["time"] +
            type_correlation * weights["type"] +
            significance_correlation * weights["significance"]
        )
        
    def _calculate_pattern_correlation(
        self,
        pattern1: Dict[str, Any],
        pattern2: Dict[str, Any]
    ) -> float:
        """Calculate correlation between two patterns."""
        # Consider multiple factors
        time_correlation = self._calculate_time_correlation(
            pattern1["start_time"],
            pattern2["start_time"]
        )
        
        type_correlation = float(
            pattern1["dominant_type"] == pattern2["dominant_type"]
        )
        
        significance_correlation = 1 - abs(
            pattern1["significance"] - pattern2["significance"]
        )
        
        # Weighted combination
        weights = {
            "time": 0.3,
            "type": 0.4,
            "significance": 0.3
        }
        
        return (
            time_correlation * weights["time"] +
            type_correlation * weights["type"] +
            significance_correlation * weights["significance"]
        )
        
    def _calculate_time_correlation(
        self,
        time1: datetime,
        time2: datetime
    ) -> float:
        """Calculate correlation between two timestamps."""
        time_diff = abs((time2 - time1).total_seconds())
        max_diff = 365 * 24 * 60 * 60  # One year in seconds
        
        return 1 - min(time_diff / max_diff, 1.0)
        
    def _calculate_period_confidence(
        self,
        period_analysis: Dict[str, Any]
    ) -> float:
        """Calculate confidence score for period analysis."""
        if not period_analysis:
            return 0.0
            
        # Calculate average significance across periods
        significances = [
            period["significance"]
            for period in period_analysis.values()
        ]
        
        return np.mean(significances)
        
    def _calculate_pattern_confidence(
        self,
        patterns: List[Dict[str, Any]]
    ) -> float:
        """Calculate confidence score for pattern detection."""
        if not patterns:
            return 0.0
            
        # Calculate average pattern significance
        significances = [pattern["significance"] for pattern in patterns]
        
        return np.mean(significances)
        
    def _update_pattern_cache(self, analysis_results: Dict[str, Any]):
        """Update pattern cache with new analysis results."""
        cache_key = hash(str(analysis_results))
        self.pattern_cache[cache_key] = {
            "results": analysis_results,
            "timestamp": datetime.now()
        }
        
    def _generate_fallback_analysis(self) -> Dict[str, Any]:
        """Generate fallback analysis when main analysis fails."""
        return {
            "period_analysis": {},
            "patterns": [],
            "correlations": {
                "event_correlations": {},
                "pattern_correlations": {},
                "time_correlations": {
                    "strength": 0.0,
                    "event_distances": {}
                },
                "overall_strength": 0.0
            },
            "confidence_scores": {
                "period_confidence": 0.0,
                "pattern_confidence": 0.0,
                "correlation_confidence": 0.0,
                "overall": 0.0
            }
        } 