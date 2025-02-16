from typing import Dict, Any, List, Optional
import numpy as np
from datetime import datetime
import json
from pathlib import Path
import logging
from transformers import pipeline
from googletrans import Translator
from ..models.birth_data import BirthData
from ..astronomy.planetary_positions import PlanetaryPositionsCalculator
from ..astronomy.house_calculator import HouseCalculator
from ..charts.divisional_charts import DivisionalChartsCalculator
from ..patterns.pattern_recognizer import PatternRecognizer
from ..feedback.feedback_learner import FeedbackLearner

logger = logging.getLogger(__name__)

class MLQuestionGenerator:
    """ML-driven dynamic question generator with multi-language support."""
    
    def __init__(self):
        """Initialize the ML question generator."""
        self.translator = Translator()
        self.sentiment_analyzer = pipeline("sentiment-analysis")
        self.response_patterns = []
        self.confidence_history = []
        self.language = "en"
        
        # Load Prashna Kundali rules
        self.prashna_rules = self._load_prashna_rules()
        
        # Initialize language translations
        self.translations = {
            "mr": self._load_translations("marathi"),
            "sa": self._load_translations("sanskrit"),
            "hi": self._load_translations("hindi")
        }
        
        self.planetary_calculator = PlanetaryPositionsCalculator()
        self.house_calculator = HouseCalculator()
        self.divisional_calculator = DivisionalChartsCalculator()
        
        # Initialize Prashna Kundali mappings
        self.prashna_mappings = {
            'career': {
                'houses': [1, 2, 6, 10],
                'planets': ['Sun', 'Saturn', 'Jupiter'],
                'aspects': ['trine', 'sextile']
            },
            'relationship': {
                'houses': [5, 7, 11],
                'planets': ['Venus', 'Jupiter', 'Moon'],
                'aspects': ['conjunction', 'trine']
            },
            'health': {
                'houses': [1, 6, 8],
                'planets': ['Sun', 'Mars', 'Saturn'],
                'aspects': ['square', 'opposition']
            },
            'spirituality': {
                'houses': [9, 12],
                'planets': ['Jupiter', 'Ketu'],
                'aspects': ['conjunction', 'trine']
            }
        }
        
        self.question_generator = pipeline("text2text-generation", model="t5-base")
        self.question_templates = []
        self.confidence_scores = {}
        self.supported_languages = ['en', 'hi', 'mr', 'sa']  # Added Sanskrit and Marathi
        self.pattern_recognizer = PatternRecognizer()
        self.feedback_learner = FeedbackLearner()
    
    def _load_prashna_rules(self) -> Dict[str, Any]:
        """Load Prashna Kundali analysis rules."""
        rules_path = Path(__file__).parent / "data" / "prashna_rules.json"
        try:
            with open(rules_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading Prashna rules: {str(e)}")
            return {}
            
    def _load_translations(self, language: str) -> Dict[str, str]:
        """Load translations for a specific language."""
        translation_path = Path(__file__).parent / "data" / f"{language}_translations.json"
        try:
            with open(translation_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading {language} translations: {str(e)}")
            return {}
            
    def set_language(self, language_code: str):
        """Set the question generation language."""
        if language_code in ["en", "mr", "sa", "hi"]:
            self.language = language_code
        else:
            logger.warning(f"Unsupported language code: {language_code}. Using English.")
            self.language = "en"
            
    def generate_questions(
        self,
        user_context: Dict[str, Any],
        previous_responses: List[UserResponse],
        confidence_threshold: float = 0.7
    ) -> List[QuestionTemplate]:
        """Generate personalized questions based on user context and previous responses."""
        try:
            # Analyze previous responses for patterns
            patterns = self._analyze_response_patterns(previous_responses)
            
            # Generate base questions from patterns
            base_questions = self._generate_base_questions(patterns, user_context)
            
            # Adapt questions based on confidence scores
            adapted_questions = self._adapt_questions_by_confidence(
                base_questions,
                confidence_threshold
            )
            
            # Detect user's preferred language
            user_language = detect_language(previous_responses)
            
            # Translate questions if necessary
            translated_questions = self._translate_questions(
                adapted_questions,
                user_language
            )
            
            # Apply Prashna Kundali techniques
            enhanced_questions = self._apply_prashna_kundali(translated_questions)
            
            # Personalize based on user profile
            personalized_questions = self._personalize_questions(
                enhanced_questions,
                user_context
            )
            
            return personalized_questions
            
        except Exception as e:
            print(f"Error generating questions: {str(e)}")
            return self._get_fallback_questions()
    
    def _analyze_response_patterns(
        self,
        previous_responses: Optional[List[Dict[str, Any]]]
    ) -> List[Dict[str, Any]]:
        """Analyze patterns in previous responses using ML."""
        if not previous_responses:
            return []
            
        patterns = []
        
        # Analyze response consistency
        consistency_pattern = self._analyze_response_consistency(previous_responses)
        if consistency_pattern:
            patterns.append(consistency_pattern)
            
        # Analyze confidence trends
        confidence_pattern = self._analyze_confidence_trends(previous_responses)
        if confidence_pattern:
            patterns.append(confidence_pattern)
            
        # Analyze event clusters
        event_pattern = self._analyze_event_clusters(previous_responses)
        if event_pattern:
            patterns.append(event_pattern)
            
        # Apply ML-based pattern recognition
        ml_patterns = self.pattern_recognizer.analyze_patterns(previous_responses)
        patterns.extend(ml_patterns)
        
        return patterns
    
    def _apply_prashna_kundali(
        self,
        questions: List[QuestionTemplate]
    ) -> List[QuestionTemplate]:
        """Apply Prashna Kundali techniques to enhance questions."""
        enhanced_questions = []
        
        for question in questions:
            # Get Prashna Kundali insights
            prashna_insights = self._get_prashna_insights(question.context)
            
            # Enhance question based on insights
            enhanced_question = self._enhance_with_prashna(question, prashna_insights)
            enhanced_questions.append(enhanced_question)
        
        return enhanced_questions
    
    def _get_prashna_insights(
        self,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Get insights from Prashna Kundali analysis."""
        current_time = datetime.now()
        
        # Calculate Prashna chart
        prashna_chart = self._calculate_prashna_chart(current_time)
        
        # Analyze significators
        significators = self._analyze_significators(prashna_chart, context)
        
        # Get house influences
        house_influences = self._analyze_house_influences(prashna_chart)
        
        return {
            'chart': prashna_chart,
            'significators': significators,
            'house_influences': house_influences,
            'timing': self._analyze_timing(current_time)
        }
    
    def _enhance_with_prashna(
        self,
        question: QuestionTemplate,
        insights: Dict[str, Any]
    ) -> QuestionTemplate:
        """Enhance question using Prashna Kundali insights."""
        # Modify question based on significators
        modified_text = self._modify_by_significators(
            question.text,
            insights['significators']
        )
        
        # Add timing context
        timing_context = self._get_timing_context(insights['timing'])
        
        # Create enhanced question
        enhanced_question = QuestionTemplate(
            text=modified_text,
            context={
                **question.context,
                'prashna_insights': insights,
                'timing_context': timing_context
            },
            confidence=question.confidence
        )
        
        return enhanced_question
    
    def _personalize_questions(
        self,
        questions: List[QuestionTemplate],
        user_context: Dict[str, Any]
    ) -> List[QuestionTemplate]:
        """Personalize questions based on user profile."""
        personalized = []
        
        for question in questions:
            # Get user preferences
            preferences = user_context.get('preferences', {})
            
            # Adapt question style
            adapted_style = self._adapt_question_style(
                question,
                preferences.get('communication_style', 'neutral')
            )
            
            # Adjust complexity
            adjusted_complexity = self._adjust_complexity(
                adapted_style,
                preferences.get('expertise_level', 'intermediate')
            )
            
            # Add cultural context
            cultural_context = self._add_cultural_context(
                adjusted_complexity,
                preferences.get('cultural_background', 'general')
            )
            
            personalized.append(cultural_context)
        
        return personalized
    
    def _adapt_question_style(
        self,
        question: QuestionTemplate,
        style: str
    ) -> QuestionTemplate:
        """Adapt question style based on user preference."""
        style_templates = {
            'formal': "Kindly provide information about {topic}",
            'casual': "Tell me about {topic}",
            'technical': "Specify the details of {topic}",
            'neutral': "{original_text}"
        }
        
        template = style_templates.get(style, style_templates['neutral'])
        modified_text = template.format(
            topic=question.context.get('topic', ''),
            original_text=question.text
        )
        
        return QuestionTemplate(
            text=modified_text,
            context=question.context,
            confidence=question.confidence
        )
    
    def _adjust_complexity(
        self,
        question: QuestionTemplate,
        level: str
    ) -> QuestionTemplate:
        """Adjust question complexity based on user expertise."""
        complexity_modifiers = {
            'beginner': self._simplify_question,
            'intermediate': lambda q: q,
            'advanced': self._enhance_complexity
        }
        
        modifier = complexity_modifiers.get(level, lambda q: q)
        return modifier(question)
    
    def _add_cultural_context(
        self,
        question: QuestionTemplate,
        background: str
    ) -> QuestionTemplate:
        """Add cultural context to questions."""
        if background == 'general':
            return question
            
        cultural_context = self._get_cultural_references(background)
        modified_text = self._integrate_cultural_context(
            question.text,
            cultural_context
        )
        
        return QuestionTemplate(
            text=modified_text,
            context={
                **question.context,
                'cultural_context': cultural_context
            },
            confidence=question.confidence
        )
    
    def _get_cultural_references(self, background: str) -> Dict[str, Any]:
        """Get cultural references for the given background."""
        # Implementation will be added in the next iteration
        return {}
    
    def _integrate_cultural_context(
        self,
        text: str,
        context: Dict[str, Any]
    ) -> str:
        """Integrate cultural context into question text."""
        # Implementation will be added in the next iteration
        return text
    
    def _calculate_response_consistency(self, responses: Dict[str, Any]) -> float:
        """Calculate consistency score for responses."""
        if not responses:
            return 0.0
            
        consistent_count = 0
        total_count = 0
        
        for response in responses.values():
            if isinstance(response, dict) and "confidence" in response:
                if response["confidence"] > 0.8:
                    consistent_count += 1
                total_count += 1
        
        return consistent_count / max(total_count, 1)
    
    def _analyze_time_precision(self, responses: Dict[str, Any]) -> Dict[str, float]:
        """Analyze time precision in responses."""
        precision_scores = {}
        
        for question_id, response in responses.items():
            if isinstance(response, dict) and "time" in response:
                precision = self._calculate_time_precision(response["time"])
                precision_scores[question_id] = precision
        
        return precision_scores
    
    def _identify_event_clusters(self, responses: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identify clusters of related events in responses."""
        events = []
        
        for response in responses.values():
            if isinstance(response, dict) and "event_type" in response:
                events.append({
                    "type": response["event_type"],
                    "time": response.get("time"),
                    "confidence": response.get("confidence", 0.0)
                })
        
        # Cluster events by type and time proximity
        return self._cluster_events(events)
    
    def _cluster_events(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Cluster events based on type and timing."""
        clusters = []
        
        for event in events:
            added_to_cluster = False
            
            for cluster in clusters:
                if self._events_are_related(event, cluster["events"][0]):
                    cluster["events"].append(event)
                    added_to_cluster = True
                    break
            
            if not added_to_cluster:
                clusters.append({
                    "type": event["type"],
                    "events": [event]
                })
        
        return clusters
    
    def _events_are_related(self, event1: Dict[str, Any], 
                           event2: Dict[str, Any]) -> bool:
        """Check if two events are related based on type and timing."""
        if event1["type"] == event2["type"]:
            return True
            
        if "time" in event1 and "time" in event2:
            time_diff = abs(event1["time"] - event2["time"])
            return time_diff.days < 30
            
        return False
    
    def _analyze_confidence_trends(self, responses: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze trends in confidence scores."""
        confidence_trends = {
            "overall": [],
            "by_category": {}
        }
        
        for response in responses.values():
            if isinstance(response, dict) and "confidence" in response:
                confidence_trends["overall"].append(response["confidence"])
                
                category = response.get("category", "general")
                if category not in confidence_trends["by_category"]:
                    confidence_trends["by_category"][category] = []
                confidence_trends["by_category"][category].append(response["confidence"])
        
        return confidence_trends
    
    def _calculate_time_precision(self, time_str: str) -> float:
        """Calculate precision score for a time response."""
        try:
            # Parse time string and calculate precision
            if ":" in time_str:
                parts = time_str.split(":")
                if len(parts) == 3:  # HH:MM:SS
                    return 1.0
                elif len(parts) == 2:  # HH:MM
                    return 0.8
            elif "hour" in time_str.lower():
                return 0.6
            elif "morning" in time_str.lower() or "evening" in time_str.lower():
                return 0.4
            return 0.2
        except:
            return 0.0 