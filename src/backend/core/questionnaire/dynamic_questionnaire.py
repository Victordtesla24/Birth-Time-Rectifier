from typing import List, Dict, Any, Optional
import numpy as np
from transformers import pipeline
from sklearn.cluster import KMeans
from ..models.user_response import UserResponse
from ..models.question_template import QuestionTemplate
from ..utils.language_detector import detect_language
from ..utils.confidence_calculator import calculate_confidence

class DynamicQuestionnaireGenerator:
    def __init__(self):
        self.question_generator = pipeline("text2text-generation", model="t5-base")
        self.response_patterns = []
        self.question_templates = []
        self.confidence_scores = {}
        self.supported_languages = ['en', 'es', 'fr', 'de', 'hi']
        
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
            
            return translated_questions
            
        except Exception as e:
            print(f"Error generating questions: {str(e)}")
            return self._get_fallback_questions()
    
    def _analyze_response_patterns(
        self,
        responses: List[UserResponse]
    ) -> List[Dict[str, Any]]:
        """Analyze patterns in user responses using ML clustering."""
        if not responses:
            return []
            
        # Extract features from responses
        features = self._extract_response_features(responses)
        
        # Perform clustering to identify patterns
        kmeans = KMeans(n_clusters=min(3, len(responses)))
        clusters = kmeans.fit_predict(features)
        
        # Analyze patterns within each cluster
        patterns = []
        for cluster_id in range(kmeans.n_clusters):
            cluster_responses = [r for i, r in enumerate(responses) if clusters[i] == cluster_id]
            pattern = {
                'cluster_id': cluster_id,
                'common_themes': self._extract_common_themes(cluster_responses),
                'confidence': self._calculate_cluster_confidence(cluster_responses),
                'response_time': np.mean([r.response_time for r in cluster_responses])
            }
            patterns.append(pattern)
        
        return patterns
    
    def _generate_base_questions(
        self,
        patterns: List[Dict[str, Any]],
        user_context: Dict[str, Any]
    ) -> List[QuestionTemplate]:
        """Generate base questions using ML model."""
        questions = []
        
        for pattern in patterns:
            # Create context for question generation
            generation_context = {
                'themes': pattern['common_themes'],
                'user_context': user_context,
                'confidence': pattern['confidence']
            }
            
            # Generate questions using T5 model
            generated_text = self.question_generator(
                self._format_generation_prompt(generation_context),
                max_length=100,
                num_return_sequences=3
            )
            
            # Convert generated text to question templates
            for text in generated_text:
                question = QuestionTemplate(
                    text=text['generated_text'],
                    context=generation_context,
                    confidence=pattern['confidence']
                )
                questions.append(question)
        
        return questions
    
    def _adapt_questions_by_confidence(
        self,
        questions: List[QuestionTemplate],
        confidence_threshold: float
    ) -> List[QuestionTemplate]:
        """Adapt questions based on confidence scores."""
        adapted_questions = []
        
        for question in questions:
            if question.confidence < confidence_threshold:
                # Generate follow-up questions for low confidence areas
                follow_ups = self._generate_follow_up_questions(question)
                adapted_questions.extend(follow_ups)
            else:
                adapted_questions.append(question)
        
        # Sort by priority (confidence and importance)
        return sorted(
            adapted_questions,
            key=lambda q: (q.confidence, q.context.get('importance', 0)),
            reverse=True
        )
    
    def _translate_questions(
        self,
        questions: List[QuestionTemplate],
        target_language: str
    ) -> List[QuestionTemplate]:
        """Translate questions to target language if supported."""
        if target_language not in self.supported_languages:
            return questions
            
        translated_questions = []
        for question in questions:
            translated_text = self._translate_text(
                question.text,
                target_language
            )
            translated_question = QuestionTemplate(
                text=translated_text,
                context=question.context,
                confidence=question.confidence
            )
            translated_questions.append(translated_question)
        
        return translated_questions
    
    def _extract_response_features(
        self,
        responses: List[UserResponse]
    ) -> np.ndarray:
        """Extract numerical features from responses for clustering."""
        features = []
        for response in responses:
            feature_vector = [
                response.confidence,
                response.response_time,
                len(response.text),
                response.clarity_score
            ]
            features.append(feature_vector)
        return np.array(features)
    
    def _extract_common_themes(
        self,
        responses: List[UserResponse]
    ) -> List[str]:
        """Extract common themes from a group of responses."""
        # Implement theme extraction logic
        return []
    
    def _calculate_cluster_confidence(
        self,
        responses: List[UserResponse]
    ) -> float:
        """Calculate confidence score for a cluster of responses."""
        if not responses:
            return 0.0
        return np.mean([r.confidence for r in responses])
    
    def _format_generation_prompt(
        self,
        context: Dict[str, Any]
    ) -> str:
        """Format context into a prompt for the question generator."""
        themes = ', '.join(context['themes'])
        return f"Generate a question about {themes} considering {context['user_context']}"
    
    def _generate_follow_up_questions(
        self,
        question: QuestionTemplate
    ) -> List[QuestionTemplate]:
        """Generate follow-up questions for low confidence areas."""
        # Implement follow-up question generation logic
        return []
    
    def _translate_text(
        self,
        text: str,
        target_language: str
    ) -> str:
        """Translate text to target language."""
        # Implement translation logic
        return text
    
    def _get_fallback_questions(self) -> List[QuestionTemplate]:
        """Return fallback questions in case of errors."""
        return [
            QuestionTemplate(
                text="Could you please provide more details about your birth time?",
                context={'type': 'fallback'},
                confidence=0.5
            )
        ] 