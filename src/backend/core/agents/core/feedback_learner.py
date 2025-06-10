"""Real-time learning module for user feedback."""

from typing import Dict, Any, List, Optional
from datetime import datetime
import numpy as np
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class FeedbackLearner:
    """Handles real-time learning from user feedback."""
    
    def __init__(self, feedback_threshold: int = 10):
        """Initialize feedback learner."""
        self.feedback_threshold = feedback_threshold
        self.feedback_history = []
        self.learning_metrics = {
            "total_feedback": 0,
            "positive_feedback": 0,
            "accuracy_improvements": 0,
            "error_rate": 0.0
        }
        self.adaptation_rules = self._load_adaptation_rules()
    
    def _load_adaptation_rules(self) -> Dict[str, Any]:
        """Load adaptation rules from configuration."""
        rules_path = Path(__file__).parent / "adaptation_rules.json"
        if rules_path.exists():
            with open(rules_path, "r") as f:
                return json.load(f)
        return {
            "accuracy_threshold": 0.8,
            "error_threshold": 0.2,
            "learning_rate": 0.1,
            "adaptation_weights": {
                "user_feedback": 0.4,
                "error_patterns": 0.3,
                "accuracy_metrics": 0.3
            }
        }
    
    def process_feedback(self, feedback_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process new user feedback and update learning metrics."""
        try:
            # Validate feedback
            if not self._validate_feedback(feedback_data):
                logger.warning("Invalid feedback data received")
                return {"status": "error", "message": "Invalid feedback data"}
            
            # Add timestamp
            feedback_data["timestamp"] = datetime.now().isoformat()
            
            # Update feedback history
            self.feedback_history.append(feedback_data)
            
            # Update learning metrics
            self._update_learning_metrics(feedback_data)
            
            # Check if adaptation is needed
            if len(self.feedback_history) >= self.feedback_threshold:
                adaptation_result = self._adapt_system()
                self.feedback_history = []  # Clear history after adaptation
                return adaptation_result
            
            return {
                "status": "success",
                "message": "Feedback processed",
                "metrics": self.learning_metrics
            }
            
        except Exception as e:
            logger.error(f"Error processing feedback: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def _validate_feedback(self, feedback: Dict[str, Any]) -> bool:
        """Validate feedback data structure."""
        required_fields = {
            "analysis_id",
            "accuracy_rating",
            "user_comments",
            "improvement_suggestions"
        }
        return all(field in feedback for field in required_fields)
    
    def _update_learning_metrics(self, feedback: Dict[str, Any]) -> None:
        """Update learning metrics based on new feedback."""
        self.learning_metrics["total_feedback"] += 1
        
        if feedback.get("accuracy_rating", 0) >= 0.7:
            self.learning_metrics["positive_feedback"] += 1
        
        if feedback.get("improved_accuracy", False):
            self.learning_metrics["accuracy_improvements"] += 1
        
        # Update error rate
        total = max(1, self.learning_metrics["total_feedback"])
        self.learning_metrics["error_rate"] = (
            (total - self.learning_metrics["positive_feedback"]) / total
        )
    
    def _adapt_system(self) -> Dict[str, Any]:
        """Adapt system based on accumulated feedback."""
        try:
            # Analyze feedback patterns
            patterns = self._analyze_feedback_patterns()
            
            # Calculate adaptation scores
            adaptation_scores = self._calculate_adaptation_scores(patterns)
            
            # Generate adaptation rules
            new_rules = self._generate_adaptation_rules(adaptation_scores)
            
            # Save new rules
            self._save_adaptation_rules(new_rules)
            
            return {
                "status": "success",
                "message": "System adapted based on feedback",
                "patterns": patterns,
                "adaptation_scores": adaptation_scores,
                "new_rules": new_rules
            }
            
        except Exception as e:
            logger.error(f"Error in system adaptation: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def _analyze_feedback_patterns(self) -> Dict[str, Any]:
        """Analyze patterns in accumulated feedback."""
        patterns = {
            "accuracy_trend": self._calculate_accuracy_trend(),
            "common_issues": self._identify_common_issues(),
            "improvement_suggestions": self._analyze_suggestions(),
            "user_satisfaction": self._calculate_user_satisfaction()
        }
        
        return patterns
    
    def _calculate_accuracy_trend(self) -> Dict[str, float]:
        """Calculate trend in accuracy ratings."""
        if not self.feedback_history:
            return {"trend": 0.0, "confidence": 0.0}
        
        ratings = [f.get("accuracy_rating", 0) for f in self.feedback_history]
        trend = np.polyfit(range(len(ratings)), ratings, 1)[0]
        confidence = np.corrcoef(range(len(ratings)), ratings)[0, 1]
        
        return {
            "trend": float(trend),
            "confidence": float(abs(confidence))
        }
    
    def _identify_common_issues(self) -> List[Dict[str, Any]]:
        """Identify common issues from feedback."""
        issues = {}
        
        for feedback in self.feedback_history:
            for issue in feedback.get("issues", []):
                if issue["type"] not in issues:
                    issues[issue["type"]] = {
                        "count": 0,
                        "severity": 0.0,
                        "examples": []
                    }
                
                issues[issue["type"]]["count"] += 1
                issues[issue["type"]]["severity"] += issue.get("severity", 0.5)
                issues[issue["type"]]["examples"].append(issue.get("description"))
        
        # Calculate average severity and sort by frequency
        return [
            {
                "type": issue_type,
                "count": data["count"],
                "severity": data["severity"] / data["count"],
                "examples": data["examples"][:3]  # Limit to 3 examples
            }
            for issue_type, data in sorted(
                issues.items(),
                key=lambda x: x[1]["count"],
                reverse=True
            )
        ]
    
    def _analyze_suggestions(self) -> List[Dict[str, Any]]:
        """Analyze improvement suggestions from feedback."""
        suggestions = {}
        
        for feedback in self.feedback_history:
            for suggestion in feedback.get("improvement_suggestions", []):
                if suggestion["category"] not in suggestions:
                    suggestions[suggestion["category"]] = {
                        "count": 0,
                        "impact": 0.0,
                        "details": []
                    }
                
                suggestions[suggestion["category"]]["count"] += 1
                suggestions[suggestion["category"]]["impact"] += suggestion.get("impact", 0.5)
                suggestions[suggestion["category"]]["details"].append(suggestion.get("detail"))
        
        # Calculate average impact and sort by frequency
        return [
            {
                "category": category,
                "count": data["count"],
                "impact": data["impact"] / data["count"],
                "details": data["details"][:3]  # Limit to 3 details
            }
            for category, data in sorted(
                suggestions.items(),
                key=lambda x: x[1]["count"],
                reverse=True
            )
        ]
    
    def _calculate_user_satisfaction(self) -> float:
        """Calculate overall user satisfaction score."""
        if not self.feedback_history:
            return 0.0
        
        satisfaction_scores = [
            f.get("satisfaction_rating", 0)
            for f in self.feedback_history
            if "satisfaction_rating" in f
        ]
        
        return np.mean(satisfaction_scores) if satisfaction_scores else 0.0
    
    def _calculate_adaptation_scores(self, patterns: Dict[str, Any]) -> Dict[str, float]:
        """Calculate adaptation scores for different aspects."""
        weights = self.adaptation_rules["adaptation_weights"]
        
        scores = {
            "accuracy": patterns["accuracy_trend"]["trend"] * weights["accuracy_metrics"],
            "user_satisfaction": patterns["user_satisfaction"] * weights["user_feedback"],
            "issue_resolution": (
                1 - len(patterns["common_issues"]) / 10  # Normalize to 0-1
            ) * weights["error_patterns"]
        }
        
        return scores
    
    def _generate_adaptation_rules(self, scores: Dict[str, float]) -> Dict[str, Any]:
        """Generate new adaptation rules based on scores."""
        current_rules = self.adaptation_rules.copy()
        
        # Adjust accuracy threshold
        if scores["accuracy"] > 0:
            current_rules["accuracy_threshold"] = min(
                0.95,
                current_rules["accuracy_threshold"] + 0.05
            )
        else:
            current_rules["accuracy_threshold"] = max(
                0.7,
                current_rules["accuracy_threshold"] - 0.05
            )
        
        # Adjust error threshold
        if scores["issue_resolution"] > 0.7:
            current_rules["error_threshold"] = max(
                0.1,
                current_rules["error_threshold"] - 0.02
            )
        else:
            current_rules["error_threshold"] = min(
                0.3,
                current_rules["error_threshold"] + 0.02
            )
        
        # Adjust learning rate
        if scores["user_satisfaction"] > 0.8:
            current_rules["learning_rate"] = max(
                0.05,
                current_rules["learning_rate"] - 0.01
            )
        else:
            current_rules["learning_rate"] = min(
                0.2,
                current_rules["learning_rate"] + 0.01
            )
        
        return current_rules
    
    def _save_adaptation_rules(self, rules: Dict[str, Any]) -> None:
        """Save updated adaptation rules."""
        rules_path = Path(__file__).parent / "adaptation_rules.json"
        with open(rules_path, "w") as f:
            json.dump(rules, f, indent=2)
        
        self.adaptation_rules = rules 