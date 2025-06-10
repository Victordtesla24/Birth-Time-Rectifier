"""Enhanced pattern recognition module."""

from typing import Dict, Any, List, Optional, Tuple
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class PatternRecognizer:
    """Advanced pattern recognition for birth time rectification."""
    
    def __init__(self):
        """Initialize pattern recognizer."""
        self.scaler = StandardScaler()
        self.pca = PCA(n_components=0.95)  # Keep 95% of variance
        self.pattern_cache = {}
        self.confidence_thresholds = {
            "temporal": 0.7,
            "event": 0.8,
            "planetary": 0.75,
            "correlation": 0.65
        }
    
    def analyze_patterns(
        self,
        birth_data: Dict[str, Any],
        events: List[Dict[str, Any]],
        planetary_positions: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform comprehensive pattern analysis."""
        try:
            # Extract features
            features = self._extract_features(birth_data, events, planetary_positions)
            
            # Analyze different pattern types
            temporal_patterns = self._analyze_temporal_patterns(events)
            event_patterns = self._analyze_event_patterns(events)
            planetary_patterns = self._analyze_planetary_patterns(
                planetary_positions,
                events
            )
            correlation_patterns = self._analyze_correlation_patterns(
                events,
                planetary_positions
            )
            
            # Detect clusters and anomalies
            clusters = self._detect_clusters(features)
            anomalies = self._detect_anomalies(features)
            
            # Calculate pattern confidence
            confidence_scores = self._calculate_confidence_scores(
                temporal_patterns,
                event_patterns,
                planetary_patterns,
                correlation_patterns,
                clusters,
                anomalies
            )
            
            return {
                "temporal_patterns": temporal_patterns,
                "event_patterns": event_patterns,
                "planetary_patterns": planetary_patterns,
                "correlation_patterns": correlation_patterns,
                "clusters": clusters,
                "anomalies": anomalies,
                "confidence_scores": confidence_scores
            }
            
        except Exception as e:
            logger.error(f"Error in pattern analysis: {str(e)}")
            return self._generate_fallback_analysis()
    
    def _extract_features(
        self,
        birth_data: Dict[str, Any],
        events: List[Dict[str, Any]],
        planetary_positions: Dict[str, Any]
    ) -> np.ndarray:
        """Extract numerical features for pattern analysis."""
        features = []
        
        for event in events:
            # Convert event data to numerical features
            event_features = [
                event["time"].timestamp(),  # Time as Unix timestamp
                float(event.get("intensity", 0.5)),
                len(event.get("description", "")),
                hash(event.get("type", "")) % 100,  # Simple type encoding
                self._calculate_planetary_strength(
                    event["time"],
                    planetary_positions
                )
            ]
            features.append(event_features)
        
        # Scale features
        scaled_features = self.scaler.fit_transform(features)
        
        # Apply PCA
        return self.pca.fit_transform(scaled_features)
    
    def _analyze_temporal_patterns(
        self,
        events: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Analyze temporal patterns in events."""
        patterns = []
        
        # Sort events by time
        sorted_events = sorted(events, key=lambda x: x["time"])
        
        # Analyze time intervals
        intervals = []
        for i in range(len(sorted_events) - 1):
            interval = (
                sorted_events[i + 1]["time"] - sorted_events[i]["time"]
            ).total_seconds()
            intervals.append(interval)
        
        if intervals:
            # Calculate interval statistics
            mean_interval = np.mean(intervals)
            std_interval = np.std(intervals)
            
            # Detect regular intervals
            regular_intervals = []
            for i, interval in enumerate(intervals):
                if abs(interval - mean_interval) <= std_interval:
                    regular_intervals.append({
                        "event1": sorted_events[i]["id"],
                        "event2": sorted_events[i + 1]["id"],
                        "interval": interval
                    })
            
            if regular_intervals:
                patterns.append({
                    "type": "regular_interval",
                    "mean_interval": mean_interval,
                    "std_interval": std_interval,
                    "occurrences": regular_intervals
                })
        
        # Detect seasonal patterns
        seasonal_patterns = self._detect_seasonal_patterns(sorted_events)
        if seasonal_patterns:
            patterns.extend(seasonal_patterns)
        
        return patterns
    
    def _analyze_event_patterns(
        self,
        events: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Analyze patterns in event characteristics."""
        patterns = []
        
        # Group events by type
        type_groups = {}
        for event in events:
            event_type = event.get("type")
            if event_type not in type_groups:
                type_groups[event_type] = []
            type_groups[event_type].append(event)
        
        # Analyze each event type
        for event_type, group in type_groups.items():
            # Calculate type statistics
            avg_intensity = np.mean([
                e.get("intensity", 0.5)
                for e in group
            ])
            
            # Check for significant patterns
            if len(group) >= 3 and avg_intensity >= 0.7:
                patterns.append({
                    "type": "significant_event_type",
                    "event_type": event_type,
                    "count": len(group),
                    "average_intensity": avg_intensity,
                    "events": [e["id"] for e in group]
                })
        
        return patterns
    
    def _analyze_planetary_patterns(
        self,
        planetary_positions: Dict[str, Any],
        events: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Analyze patterns in planetary positions during events."""
        patterns = []
        
        # Calculate planetary aspects
        aspects = self._calculate_aspects(planetary_positions)
        
        # Group events by planetary aspects
        aspect_groups = {}
        for event in events:
            event_aspects = self._get_event_aspects(
                event["time"],
                planetary_positions
            )
            
            for aspect in event_aspects:
                key = f"{aspect['planet1']}_{aspect['type']}_{aspect['planet2']}"
                if key not in aspect_groups:
                    aspect_groups[key] = []
                aspect_groups[key].append(event["id"])
        
        # Identify significant aspect patterns
        for aspect_key, event_ids in aspect_groups.items():
            if len(event_ids) >= 2:  # At least 2 events with same aspect
                planet1, aspect_type, planet2 = aspect_key.split("_")
                patterns.append({
                    "type": "planetary_aspect",
                    "planet1": planet1,
                    "planet2": planet2,
                    "aspect_type": aspect_type,
                    "event_count": len(event_ids),
                    "events": event_ids
                })
        
        return patterns
    
    def _analyze_correlation_patterns(
        self,
        events: List[Dict[str, Any]],
        planetary_positions: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Analyze correlation patterns between events and planetary positions."""
        patterns = []
        
        # Calculate event correlations
        correlations = []
        for i, event1 in enumerate(events):
            for j, event2 in enumerate(events[i+1:], i+1):
                correlation = self._calculate_event_correlation(
                    event1,
                    event2,
                    planetary_positions
                )
                if correlation["strength"] >= 0.7:  # Strong correlation
                    correlations.append(correlation)
        
        # Group correlations by type
        correlation_groups = {}
        for correlation in correlations:
            if correlation["type"] not in correlation_groups:
                correlation_groups[correlation["type"]] = []
            correlation_groups[correlation["type"]].append(correlation)
        
        # Identify significant correlation patterns
        for corr_type, group in correlation_groups.items():
            if len(group) >= 2:  # At least 2 correlations of same type
                patterns.append({
                    "type": "event_correlation",
                    "correlation_type": corr_type,
                    "count": len(group),
                    "average_strength": np.mean([c["strength"] for c in group]),
                    "correlations": group
                })
        
        return patterns
    
    def _detect_clusters(self, features: np.ndarray) -> List[Dict[str, Any]]:
        """Detect clusters in event features."""
        clusters = []
        
        # Use DBSCAN for clustering
        dbscan = DBSCAN(eps=0.5, min_samples=2)
        cluster_labels = dbscan.fit_predict(features)
        
        # Process clusters
        unique_labels = set(cluster_labels)
        for label in unique_labels:
            if label != -1:  # Ignore noise points
                cluster_indices = np.where(cluster_labels == label)[0]
                clusters.append({
                    "cluster_id": int(label),
                    "size": len(cluster_indices),
                    "indices": cluster_indices.tolist(),
                    "centroid": features[cluster_indices].mean(axis=0).tolist()
                })
        
        return clusters
    
    def _detect_anomalies(self, features: np.ndarray) -> List[Dict[str, Any]]:
        """Detect anomalies in event features."""
        anomalies = []
        
        # Calculate feature statistics
        feature_mean = np.mean(features, axis=0)
        feature_std = np.std(features, axis=0)
        
        # Detect points beyond 3 standard deviations
        for i, point in enumerate(features):
            z_scores = abs((point - feature_mean) / feature_std)
            if np.any(z_scores > 3):
                anomalies.append({
                    "index": i,
                    "z_scores": z_scores.tolist(),
                    "features": point.tolist()
                })
        
        return anomalies
    
    def _calculate_confidence_scores(
        self,
        temporal_patterns: List[Dict[str, Any]],
        event_patterns: List[Dict[str, Any]],
        planetary_patterns: List[Dict[str, Any]],
        correlation_patterns: List[Dict[str, Any]],
        clusters: List[Dict[str, Any]],
        anomalies: List[Dict[str, Any]]
    ) -> Dict[str, float]:
        """Calculate confidence scores for detected patterns."""
        scores = {}
        
        # Calculate temporal confidence
        scores["temporal"] = min(
            len(temporal_patterns) * 0.2,
            self.confidence_thresholds["temporal"]
        )
        
        # Calculate event pattern confidence
        scores["event"] = min(
            len(event_patterns) * 0.25,
            self.confidence_thresholds["event"]
        )
        
        # Calculate planetary pattern confidence
        scores["planetary"] = min(
            len(planetary_patterns) * 0.15,
            self.confidence_thresholds["planetary"]
        )
        
        # Calculate correlation confidence
        scores["correlation"] = min(
            len(correlation_patterns) * 0.3,
            self.confidence_thresholds["correlation"]
        )
        
        # Calculate cluster confidence
        scores["clustering"] = len(clusters) * 0.1
        
        # Adjust for anomalies
        anomaly_penalty = len(anomalies) * 0.05
        for key in scores:
            scores[key] = max(0, scores[key] - anomaly_penalty)
        
        # Calculate overall confidence
        scores["overall"] = np.mean(list(scores.values()))
        
        return scores
    
    def _detect_seasonal_patterns(
        self,
        events: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Detect seasonal patterns in events."""
        patterns = []
        
        # Group events by month
        month_groups = {}
        for event in events:
            month = event["time"].month
            if month not in month_groups:
                month_groups[month] = []
            month_groups[month].append(event)
        
        # Identify seasonal concentrations
        avg_events_per_month = len(events) / 12
        for month, group in month_groups.items():
            if len(group) > avg_events_per_month * 1.5:  # 50% more than average
                patterns.append({
                    "type": "seasonal_concentration",
                    "month": month,
                    "count": len(group),
                    "events": [e["id"] for e in group]
                })
        
        return patterns
    
    def _calculate_planetary_strength(
        self,
        event_time: datetime,
        planetary_positions: Dict[str, Any]
    ) -> float:
        """Calculate planetary strength at event time."""
        # Simplified calculation - in real implementation, would be more complex
        return 0.75
    
    def _calculate_aspects(
        self,
        planetary_positions: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Calculate aspects between planets."""
        aspects = []
        
        # Define aspect angles and orbs
        aspect_types = {
            "conjunction": (0, 10),
            "opposition": (180, 10),
            "trine": (120, 8),
            "square": (90, 7),
            "sextile": (60, 6)
        }
        
        # Calculate aspects between all planet pairs
        planets = list(planetary_positions.keys())
        for i, planet1 in enumerate(planets):
            for planet2 in planets[i+1:]:
                # Calculate angular separation
                separation = abs(
                    planetary_positions[planet1] -
                    planetary_positions[planet2]
                )
                if separation > 180:
                    separation = 360 - separation
                
                # Check for aspects
                for aspect_type, (angle, orb) in aspect_types.items():
                    if abs(separation - angle) <= orb:
                        aspects.append({
                            "planet1": planet1,
                            "planet2": planet2,
                            "type": aspect_type,
                            "orb": abs(separation - angle)
                        })
        
        return aspects
    
    def _get_event_aspects(
        self,
        event_time: datetime,
        planetary_positions: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Get planetary aspects at event time."""
        # In real implementation, would calculate actual positions at event time
        return self._calculate_aspects(planetary_positions)
    
    def _calculate_event_correlation(
        self,
        event1: Dict[str, Any],
        event2: Dict[str, Any],
        planetary_positions: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate correlation between two events."""
        # Calculate time difference
        time_diff = abs(
            (event2["time"] - event1["time"]).total_seconds()
        ) / (24 * 3600)  # Convert to days
        
        # Calculate type similarity
        type_match = event1.get("type") == event2.get("type")
        
        # Calculate intensity similarity
        intensity_diff = abs(
            event1.get("intensity", 0.5) -
            event2.get("intensity", 0.5)
        )
        
        # Calculate correlation strength
        strength = 0.0
        if type_match:
            strength += 0.4
        if time_diff <= 30:  # Within 30 days
            strength += 0.3
        if intensity_diff <= 0.2:
            strength += 0.3
        
        return {
            "event1_id": event1["id"],
            "event2_id": event2["id"],
            "type": "sequential" if event1["time"] < event2["time"] else "reverse",
            "strength": strength,
            "time_difference_days": time_diff
        }
    
    def _generate_fallback_analysis(self) -> Dict[str, Any]:
        """Generate fallback analysis when main analysis fails."""
        return {
            "temporal_patterns": [],
            "event_patterns": [],
            "planetary_patterns": [],
            "correlation_patterns": [],
            "clusters": [],
            "anomalies": [],
            "confidence_scores": {
                "temporal": 0.0,
                "event": 0.0,
                "planetary": 0.0,
                "correlation": 0.0,
                "clustering": 0.0,
                "overall": 0.0
            }
        } 