from typing import Dict, Any, List, Optional
import numpy as np
from datetime import datetime
import logging
import openai
import json
import hashlib
from pathlib import Path

logger = logging.getLogger(__name__)

class EnhancedMLEngine:
    """Enhanced ML engine with real-time learning and advanced pattern recognition."""
    
    def __init__(self, api_key: str, model_version: str = "gpt-4"):
        self.api_key = api_key
        self.model_version = model_version
        self.model_cache = {}
        self.feedback_history = []
        self.model_version_history = []
        self.preprocessing_rules = self._load_preprocessing_rules()
        
        # Initialize OpenAI client
        openai.api_key = api_key
        
        # Initialize model versioning
        self._initialize_model_versioning()
        
        # Prashna Kundali parameters
        self.prashna_weights = {
            'lagna': 0.3,
            'hora': 0.2,
            'ghati': 0.2,
            'vighati': 0.15,
            'lipta': 0.15
        }
        
        # Question categories based on Prashna principles
        self.prashna_categories = {
            'immediate': {
                'weight': 0.4,
                'timing_factor': 'hora',
                'aspects': ['lagna_lord', 'hora_lord']
            },
            'short_term': {
                'weight': 0.3,
                'timing_factor': 'ghati',
                'aspects': ['day_lord', 'ghati_lord']
            },
            'long_term': {
                'weight': 0.3,
                'timing_factor': 'vighati',
                'aspects': ['month_lord', 'year_lord']
            }
        }
        
        # Prashna significance factors
        self.significance_factors = {
            'planetary_strength': 0.3,
            'house_significance': 0.3,
            'aspect_influence': 0.2,
            'timing_alignment': 0.2
        }
        
        # User profile factors
        self.profile_factors = {
            'experience_level': {
                'beginner': {'weight': 0.3, 'complexity': 0.3},
                'intermediate': {'weight': 0.5, 'complexity': 0.6},
                'advanced': {'weight': 0.7, 'complexity': 0.9},
                'expert': {'weight': 1.0, 'complexity': 1.0}
            },
            'preferred_language': {
                'simple': {'weight': 0.3, 'technical_terms': False},
                'moderate': {'weight': 0.6, 'technical_terms': True},
                'technical': {'weight': 1.0, 'technical_terms': True}
            },
            'focus_areas': {
                'general': 0.3,
                'career': 0.7,
                'relationships': 0.7,
                'spiritual': 0.8,
                'health': 0.6
            }
        }
        
        # Question adaptation parameters
        self.adaptation_params = {
            'complexity_threshold': 0.7,
            'technical_threshold': 0.6,
            'focus_threshold': 0.5
        }
        
        # Multi-language support
        self.language_mappings = {
            'english': {
                'terms': self._load_english_terms(),
                'templates': self._load_english_templates()
            },
            'marathi': {
                'terms': self._load_marathi_terms(),
                'templates': self._load_marathi_templates()
            },
            'sanskrit': {
                'terms': self._load_sanskrit_terms(),
                'templates': self._load_sanskrit_templates()
            },
            'hindi': {
                'terms': self._load_hindi_terms(),
                'templates': self._load_hindi_templates()
            }
        }
    
    def _initialize_model_versioning(self):
        """Initialize model versioning system."""
        self.model_version_history.append({
            "version": self.model_version,
            "timestamp": datetime.now().isoformat(),
            "changes": "Initial version"
        })
    
    def _load_preprocessing_rules(self) -> Dict[str, Any]:
        """Load data preprocessing rules."""
        rules_path = Path(__file__).parent / "preprocessing_rules.json"
        if rules_path.exists():
            with open(rules_path, "r") as f:
                return json.load(f)
        return {
            "numerical_features": ["longitude", "latitude", "confidence"],
            "categorical_features": ["event_type", "planet_name"],
            "datetime_features": ["event_time", "birth_time"],
            "text_features": ["description", "notes"]
        }
    
    async def analyze_birth_data(self, birth_data: Dict[str, Any],
                               planetary_positions: Dict[str, Any],
                               user_responses: Dict[str, Any]) -> Dict[str, Any]:
        """Perform enhanced ML analysis with real-time learning."""
        try:
            # Preprocess data
            processed_data = self._preprocess_data(birth_data, planetary_positions, user_responses)
            
            # Generate cache key
            cache_key = self._generate_cache_key(processed_data)
            
            # Check cache
            if cache_key in self.model_cache:
                logger.info("Using cached analysis result")
                return self.model_cache[cache_key]
            
            # Prepare prompt for GPT-4
            prompt = self._prepare_analysis_prompt(processed_data)
            
            # Get ML analysis
            response = await openai.ChatCompletion.acreate(
                model=self.model_version,
                messages=[
                    {"role": "system", "content": "You are an expert astrologer with deep knowledge of birth time rectification."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            # Parse and enhance response
            analysis_result = self._parse_ml_response(response.choices[0].message.content)
            
            # Cache result
            self.model_cache[cache_key] = analysis_result
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error in ML analysis: {str(e)}")
            self._handle_error(e)
            raise
    
    def _preprocess_data(self, birth_data: Dict[str, Any],
                        planetary_positions: Dict[str, Any],
                        user_responses: Dict[str, Any]) -> Dict[str, Any]:
        """Enhanced data preprocessing with validation."""
        processed_data = {}
        
        # Apply preprocessing rules
        for feature_type, features in self.preprocessing_rules.items():
            if feature_type == "numerical_features":
                processed_data.update(self._process_numerical_features(
                    birth_data, planetary_positions, features
                ))
            elif feature_type == "categorical_features":
                processed_data.update(self._process_categorical_features(
                    birth_data, user_responses, features
                ))
            elif feature_type == "datetime_features":
                processed_data.update(self._process_datetime_features(
                    birth_data, user_responses, features
                ))
            elif feature_type == "text_features":
                processed_data.update(self._process_text_features(
                    user_responses, features
                ))
        
        return processed_data
    
    def _process_numerical_features(self, birth_data: Dict[str, Any],
                                  planetary_positions: Dict[str, Any],
                                  features: List[str]) -> Dict[str, float]:
        """Process numerical features with validation."""
        processed = {}
        for feature in features:
            value = birth_data.get(feature) or planetary_positions.get(feature)
            if value is not None:
                try:
                    processed[feature] = float(value)
                except (ValueError, TypeError):
                    logger.warning(f"Invalid numerical value for {feature}: {value}")
                    processed[feature] = 0.0
        return processed
    
    def _process_categorical_features(self, birth_data: Dict[str, Any],
                                    user_responses: Dict[str, Any],
                                    features: List[str]) -> Dict[str, str]:
        """Process categorical features with validation."""
        processed = {}
        for feature in features:
            value = birth_data.get(feature) or user_responses.get(feature)
            if value is not None:
                processed[feature] = str(value)
        return processed
    
    def _process_datetime_features(self, birth_data: Dict[str, Any],
                                 user_responses: Dict[str, Any],
                                 features: List[str]) -> Dict[str, str]:
        """Process datetime features with validation."""
        processed = {}
        for feature in features:
            value = birth_data.get(feature) or user_responses.get(feature)
            if value is not None:
                try:
                    if isinstance(value, str):
                        datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
                    processed[feature] = value
                except ValueError:
                    logger.warning(f"Invalid datetime value for {feature}: {value}")
        return processed
    
    def _process_text_features(self, user_responses: Dict[str, Any],
                             features: List[str]) -> Dict[str, str]:
        """Process text features with validation."""
        processed = {}
        for feature in features:
            value = user_responses.get(feature)
            if value is not None:
                processed[feature] = str(value)
        return processed
    
    def _generate_cache_key(self, data: Dict[str, Any]) -> str:
        """Generate cache key for analysis results."""
        data_str = json.dumps(data, sort_keys=True)
        return hashlib.md5(data_str.encode()).hexdigest()
    
    def _prepare_analysis_prompt(self, data: Dict[str, Any]) -> str:
        """Prepare enhanced analysis prompt."""
        return f"""
        Please analyze the following birth time rectification data:
        
        Birth Details:
        {json.dumps(data.get('birth_data', {}), indent=2)}
        
        Planetary Positions:
        {json.dumps(data.get('planetary_positions', {}), indent=2)}
        
        User Responses:
        {json.dumps(data.get('user_responses', {}), indent=2)}
        
        Please provide:
        1. Confidence score (0-1)
        2. Suggested time adjustments (in minutes)
        3. Key factors influencing the analysis
        4. Detailed explanation of the reasoning
        5. Pattern recognition insights
        """
    
    def _parse_ml_response(self, response: str) -> Dict[str, Any]:
        """Parse and validate ML response."""
        try:
            # Extract structured data from response
            lines = response.strip().split("\n")
            result = {
                "confidence_score": 0.0,
                "time_adjustment": 0,
                "factors": [],
                "explanation": "",
                "patterns": []
            }
            
            current_section = None
            for line in lines:
                line = line.strip()
                if line.startswith("Confidence score:"):
                    result["confidence_score"] = float(line.split(":")[1].strip())
                elif line.startswith("Time adjustment:"):
                    result["time_adjustment"] = int(line.split(":")[1].strip())
                elif line.startswith("Factors:"):
                    current_section = "factors"
                elif line.startswith("Explanation:"):
                    current_section = "explanation"
                elif line.startswith("Patterns:"):
                    current_section = "patterns"
                elif line and current_section:
                    if current_section == "factors":
                        result["factors"].append(line)
                    elif current_section == "explanation":
                        result["explanation"] += line + "\n"
                    elif current_section == "patterns":
                        result["patterns"].append(line)
            
            return result
            
        except Exception as e:
            logger.error(f"Error parsing ML response: {str(e)}")
            return {
                "confidence_score": 0.5,
                "time_adjustment": 0,
                "factors": ["Error in analysis"],
                "explanation": "Failed to parse ML response",
                "patterns": []
            }
    
    def process_user_feedback(self, analysis_id: str, feedback: Dict[str, Any]) -> None:
        """Process user feedback for real-time learning."""
        try:
            self.feedback_history.append({
                "analysis_id": analysis_id,
                "feedback": feedback,
                "timestamp": datetime.now().isoformat()
            })
            
            # Update model if enough feedback is collected
            if len(self.feedback_history) >= 10:
                self._update_model_from_feedback()
                
        except Exception as e:
            logger.error(f"Error processing user feedback: {str(e)}")
    
    def _update_model_from_feedback(self) -> None:
        """Update model based on collected feedback."""
        try:
            # Analyze feedback patterns
            feedback_patterns = self._analyze_feedback_patterns()
            
            # Update preprocessing rules if needed
            if feedback_patterns.get("preprocessing_issues", 0) > 0.3:
                self._update_preprocessing_rules()
            
            # Update model version if significant improvements found
            if feedback_patterns.get("accuracy_improvement", 0) > 0.2:
                self._update_model_version()
            
            # Clear processed feedback
            self.feedback_history = []
            
        except Exception as e:
            logger.error(f"Error updating model from feedback: {str(e)}")
    
    def _analyze_feedback_patterns(self) -> Dict[str, float]:
        """Analyze patterns in user feedback."""
        patterns = {
            "preprocessing_issues": 0.0,
            "accuracy_improvement": 0.0,
            "error_rate": 0.0
        }
        
        total_feedback = len(self.feedback_history)
        if total_feedback == 0:
            return patterns
        
        preprocessing_issues = sum(
            1 for f in self.feedback_history
            if f["feedback"].get("preprocessing_error", False)
        )
        accuracy_improvements = sum(
            1 for f in self.feedback_history
            if f["feedback"].get("improved_accuracy", False)
        )
        errors = sum(
            1 for f in self.feedback_history
            if f["feedback"].get("error", False)
        )
        
        patterns["preprocessing_issues"] = preprocessing_issues / total_feedback
        patterns["accuracy_improvement"] = accuracy_improvements / total_feedback
        patterns["error_rate"] = errors / total_feedback
        
        return patterns
    
    def _update_preprocessing_rules(self) -> None:
        """Update data preprocessing rules based on feedback."""
        rules_path = Path(__file__).parent / "preprocessing_rules.json"
        
        # Update rules based on feedback patterns
        updated_rules = self.preprocessing_rules.copy()
        
        # Save updated rules
        with open(rules_path, "w") as f:
            json.dump(updated_rules, f, indent=2)
        
        self.preprocessing_rules = updated_rules
    
    def _update_model_version(self) -> None:
        """Update model version based on performance improvements."""
        self.model_version_history.append({
            "version": f"{self.model_version}-{len(self.model_version_history) + 1}",
            "timestamp": datetime.now().isoformat(),
            "changes": "Updated based on user feedback"
        })
    
    def _handle_error(self, error: Exception) -> None:
        """Handle errors with automated correction when possible."""
        try:
            error_type = type(error).__name__
            error_message = str(error)
            
            # Log error for analysis
            logger.error(f"ML Engine Error: {error_type} - {error_message}")
            
            # Attempt automated correction
            if error_type == "ValueError":
                if "invalid literal for float()" in error_message:
                    logger.info("Attempting to correct numerical parsing error")
                    # Correction logic would go here
            elif error_type == "KeyError":
                logger.info("Attempting to correct missing key error")
                # Correction logic would go here
            
            # Record error for pattern analysis
            self.feedback_history.append({
                "type": "error",
                "error_type": error_type,
                "message": error_message,
                "timestamp": datetime.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error in error handler: {str(e)}")
    
    def generate_prashna_based_questions(
        self,
        birth_data: BirthData,
        current_responses: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate questions based on Prashna Kundali principles."""
        questions = []
        
        # Calculate Prashna chart
        prashna_chart = self._calculate_prashna_chart(birth_data)
        
        # Analyze timing factors
        timing_analysis = self._analyze_prashna_timing(prashna_chart)
        
        # Generate category-specific questions
        for category, params in self.prashna_categories.items():
            category_questions = self._generate_category_questions(
                prashna_chart,
                timing_analysis,
                category,
                params,
                current_responses
            )
            questions.extend(category_questions)
        
        # Sort questions by significance
        questions.sort(key=lambda q: q['significance'], reverse=True)
        
        return questions
    
    def _calculate_prashna_chart(self, birth_data: BirthData) -> Dict[str, Any]:
        """Calculate Prashna Kundali chart details."""
        chart = {
            'lagna': self._calculate_lagna_details(birth_data),
            'hora': self._calculate_hora_details(birth_data),
            'planetary_positions': self._calculate_prashna_positions(birth_data),
            'timing_factors': self._calculate_timing_factors(birth_data)
        }
        
        return chart
    
    def _analyze_prashna_timing(self, prashna_chart: Dict[str, Any]) -> Dict[str, float]:
        """Analyze timing factors for question generation."""
        timing_scores = {}
        
        for factor, weight in self.prashna_weights.items():
            factor_strength = self._calculate_factor_strength(
                prashna_chart, factor
            )
            timing_scores[factor] = factor_strength * weight
        
        return timing_scores
    
    def _generate_category_questions(
        self,
        prashna_chart: Dict[str, Any],
        timing_analysis: Dict[str, float],
        category: str,
        params: Dict[str, Any],
        current_responses: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate questions for a specific category based on Prashna principles."""
        questions = []
        
        # Get category significance
        significance = self._calculate_category_significance(
            prashna_chart,
            timing_analysis,
            category,
            params
        )
        
        if significance > 0.5:  # Only generate questions for significant categories
            # Generate timing-based questions
            timing_questions = self._generate_timing_questions(
                prashna_chart,
                category,
                params['timing_factor']
            )
            questions.extend(timing_questions)
            
            # Generate aspect-based questions
            aspect_questions = self._generate_aspect_questions(
                prashna_chart,
                category,
                params['aspects']
            )
            questions.extend(aspect_questions)
            
            # Add significance score to each question
            for question in questions:
                question['significance'] = significance
                question['category'] = category
        
        return questions
    
    def _calculate_category_significance(
        self,
        prashna_chart: Dict[str, Any],
        timing_analysis: Dict[str, float],
        category: str,
        params: Dict[str, Any]
    ) -> float:
        """Calculate significance score for a question category."""
        significance = 0.0
        
        # 1. Planetary strength contribution
        strength = self._calculate_planetary_strength(
            prashna_chart,
            params['aspects']
        )
        significance += strength * self.significance_factors['planetary_strength']
        
        # 2. House significance contribution
        house_sig = self._calculate_house_significance(
            prashna_chart,
            category
        )
        significance += house_sig * self.significance_factors['house_significance']
        
        # 3. Aspect influence contribution
        aspect_inf = self._calculate_aspect_influence(
            prashna_chart,
            params['aspects']
        )
        significance += aspect_inf * self.significance_factors['aspect_influence']
        
        # 4. Timing alignment contribution
        timing_align = timing_analysis.get(params['timing_factor'], 0.0)
        significance += timing_align * self.significance_factors['timing_alignment']
        
        return significance
    
    def _generate_timing_questions(
        self,
        prashna_chart: Dict[str, Any],
        category: str,
        timing_factor: str
    ) -> List[Dict[str, Any]]:
        """Generate timing-related questions based on Prashna principles."""
        questions = []
        
        timing_lord = prashna_chart['timing_factors'][timing_factor]['lord']
        timing_house = prashna_chart['timing_factors'][timing_factor]['house']
        
        # Generate questions based on timing lord's position
        questions.append({
            'text': f"Did significant events related to {category} occur during {timing_lord}'s period?",
            'type': 'timing',
            'factors': {
                'lord': timing_lord,
                'house': timing_house
            }
        })
        
        return questions
    
    def _generate_aspect_questions(
        self,
        prashna_chart: Dict[str, Any],
        category: str,
        aspects: List[str]
    ) -> List[Dict[str, Any]]:
        """Generate aspect-related questions based on Prashna principles."""
        questions = []
        
        for aspect in aspects:
            aspect_details = prashna_chart['planetary_positions'][aspect]
            
            # Generate questions based on aspect positions and strengths
            questions.append({
                'text': f"Were there notable changes in {category} matters when {aspect} was prominent?",
                'type': 'aspect',
                'factors': {
                    'aspect': aspect,
                    'position': aspect_details['position'],
                    'strength': aspect_details['strength']
                }
            })
        
        return questions
    
    def generate_personalized_questions(
        self,
        birth_data: BirthData,
        user_profile: Dict[str, Any],
        current_responses: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate personalized questions based on user profile."""
        # Get base questions from Prashna analysis
        base_questions = self.generate_prashna_based_questions(
            birth_data,
            current_responses
        )
        
        # Adapt questions based on user profile
        adapted_questions = self._adapt_questions_to_profile(
            base_questions,
            user_profile
        )
        
        # Sort and filter based on user's focus areas
        final_questions = self._prioritize_questions(
            adapted_questions,
            user_profile
        )
        
        return final_questions
    
    def _adapt_questions_to_profile(
        self,
        questions: List[Dict[str, Any]],
        user_profile: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Adapt questions based on user's profile."""
        adapted_questions = []
        
        experience_level = user_profile.get('experience_level', 'beginner')
        language_pref = user_profile.get('preferred_language', 'simple')
        
        exp_params = self.profile_factors['experience_level'][experience_level]
        lang_params = self.profile_factors['preferred_language'][language_pref]
        
        for question in questions:
            adapted_question = question.copy()
            
            # Adapt complexity based on experience level
            if exp_params['complexity'] < self.adaptation_params['complexity_threshold']:
                adapted_question['text'] = self._simplify_question(
                    question['text'],
                    exp_params['complexity']
                )
            
            # Adapt technical terms based on language preference
            if not lang_params['technical_terms']:
                adapted_question['text'] = self._replace_technical_terms(
                    adapted_question['text']
                )
            
            # Add difficulty level
            adapted_question['difficulty'] = self._calculate_difficulty(
                question,
                exp_params['weight']
            )
            
            adapted_questions.append(adapted_question)
        
        return adapted_questions
    
    def _prioritize_questions(
        self,
        questions: List[Dict[str, Any]],
        user_profile: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Prioritize questions based on user's focus areas."""
        prioritized = []
        focus_areas = user_profile.get('focus_areas', ['general'])
        
        for question in questions:
            # Calculate priority score based on focus areas
            priority = self._calculate_focus_priority(
                question,
                focus_areas
            )
            
            if priority > self.adaptation_params['focus_threshold']:
                question['priority'] = priority
                prioritized.append(question)
        
        # Sort by priority and significance
        return sorted(
            prioritized,
            key=lambda q: (q['priority'], q['significance']),
            reverse=True
        )
    
    def _simplify_question(self, text: str, complexity: float) -> str:
        """Simplify question text based on complexity level."""
        if complexity < 0.4:
            # Replace complex astrological terms with simpler alternatives
            text = text.replace('planetary aspects', 'planet positions')
            text = text.replace('dasha periods', 'time periods')
            text = text.replace('yogas', 'combinations')
        elif complexity < 0.7:
            # Keep some technical terms but provide explanations
            text = text.replace(
                'dasha periods',
                'dasha periods (important time cycles)'
            )
            text = text.replace(
                'yogas',
                'yogas (special planetary combinations)'
            )
        
        return text
    
    def _replace_technical_terms(self, text: str) -> str:
        """Replace technical astrological terms with simpler alternatives."""
        replacements = {
            'lagna': 'rising sign',
            'dasha': 'time period',
            'antardasha': 'sub-period',
            'yoga': 'combination',
            'graha': 'planet',
            'bhava': 'house'
        }
        
        for term, replacement in replacements.items():
            text = text.replace(term, replacement)
        
        return text
    
    def _calculate_difficulty(
        self,
        question: Dict[str, Any],
        experience_weight: float
    ) -> float:
        """Calculate question difficulty based on factors and experience level."""
        base_difficulty = 0.5
        
        # Adjust based on question type
        if question.get('type') == 'timing':
            base_difficulty += 0.2
        elif question.get('type') == 'aspect':
            base_difficulty += 0.3
        
        # Adjust based on factors involved
        factors = question.get('factors', {})
        if 'lord' in factors:
            base_difficulty += 0.1
        if 'aspects' in factors:
            base_difficulty += 0.2
        
        # Scale based on experience weight
        return min(1.0, base_difficulty * experience_weight)
    
    def _calculate_focus_priority(
        self,
        question: Dict[str, Any],
        focus_areas: List[str]
    ) -> float:
        """Calculate question priority based on user's focus areas."""
        priority = 0.0
        category = question.get('category', 'general')
        
        # Get base priority from focus areas
        base_weight = max(
            self.profile_factors['focus_areas'].get(area, 0.3)
            for area in focus_areas
            if area in self.profile_factors['focus_areas']
        )
        
        # Adjust priority based on question category
        if category in focus_areas:
            priority = base_weight
        else:
            priority = base_weight * 0.5
        
        # Boost priority for high significance questions
        if question.get('significance', 0) > 0.8:
            priority *= 1.2
        
        return min(1.0, priority)
    
    def _load_english_terms(self) -> Dict[str, str]:
        """Load English astrological terms."""
        return {
            'lagna': 'ascendant',
            'graha': 'planet',
            'dasha': 'planetary period',
            'yoga': 'combination',
            'bhava': 'house',
            'rashi': 'sign',
            'nakshatra': 'lunar mansion'
        }
    
    def _load_marathi_terms(self) -> Dict[str, str]:
        """Load Marathi astrological terms."""
        return {
            'lagna': 'लग्न',
            'graha': 'ग्रह',
            'dasha': 'दशा',
            'yoga': 'योग',
            'bhava': 'भाव',
            'rashi': 'राशी',
            'nakshatra': 'नक्षत्र'
        }
    
    def _load_sanskrit_terms(self) -> Dict[str, str]:
        """Load Sanskrit astrological terms."""
        return {
            'lagna': 'लग्न',
            'graha': 'ग्रह',
            'dasha': 'दशा',
            'yoga': 'योग',
            'bhava': 'भाव',
            'rashi': 'राशि',
            'nakshatra': 'नक्षत्र'
        }
    
    def _load_hindi_terms(self) -> Dict[str, str]:
        """Load Hindi astrological terms."""
        return {
            'lagna': 'लग्न',
            'graha': 'ग्रह',
            'dasha': 'दशा',
            'yoga': 'योग',
            'bhava': 'भाव',
            'rashi': 'राशि',
            'nakshatra': 'नक्षत्र'
        }
    
    def _load_english_templates(self) -> Dict[str, str]:
        """Load English question templates."""
        return {
            'timing': 'Did significant events related to {category} occur during {lord}\'s period?',
            'aspect': 'Were there notable changes in {category} matters when {aspect} was prominent?',
            'house': 'Did you experience changes in {house_significations} during this period?',
            'combination': 'Was there a significant development in {area} when {planets} formed a combination?'
        }
    
    def _load_marathi_templates(self) -> Dict[str, str]:
        """Load Marathi question templates."""
        return {
            'timing': '{lord} च्या काळात {category} संबंधित महत्त्वपूर्ण घटना घडल्या का?',
            'aspect': 'जेव्हा {aspect} प्रभावी होता तेव्हा {category} मध्ये लक्षणीय बदल झाले का?',
            'house': 'या काळात {house_significations} मध्ये बदल अनुभवला का?',
            'combination': 'जेव्हा {planets} यांनी योग केला तेव्हा {area} मध्ये महत्त्वपूर्ण विकास झाला का?'
        }
    
    def _load_sanskrit_templates(self) -> Dict[str, str]:
        """Load Sanskrit question templates."""
        return {
            'timing': '{lord} दशायां {category} सम्बन्धिताः महत्त्वपूर्णाः घटनाः अभवन् वा?',
            'aspect': 'यदा {aspect} प्रभावी आसीत् तदा {category} विषये परिवर्तनं दृष्टं वा?',
            'house': 'अस्मिन् काले {house_significations} विषये परिवर्तनम् अनुभूतं वा?',
            'combination': 'यदा {planets} योगः अभवत् तदा {area} विषये महत्त्वपूर्णः विकासः अभवत् वा?'
        }
    
    def _load_hindi_templates(self) -> Dict[str, str]:
        """Load Hindi question templates."""
        return {
            'timing': '{lord} की दशा में {category} से संबंधित महत्वपूर्ण घटनाएं हुईं क्या?',
            'aspect': 'जब {aspect} प्रभावी था तब {category} में उल्लेखनीय बदलाव आए क्या?',
            'house': 'इस काल में {house_significations} में बदलाव महसूस किया क्या?',
            'combination': 'जब {planets} ने योग बनाया तब {area} में महत्वपूर्ण विकास हुआ क्या?'
        }
    
    def generate_multilingual_questions(
        self,
        birth_data: BirthData,
        user_profile: Dict[str, Any],
        current_responses: Dict[str, Any]
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Generate questions in multiple languages based on user preferences."""
        # Get base questions
        base_questions = self.generate_personalized_questions(
            birth_data,
            user_profile,
            current_responses
        )
        
        # Generate questions in all requested languages
        multilingual_questions = {}
        requested_languages = user_profile.get('languages', ['english'])
        
        for language in requested_languages:
            if language in self.language_mappings:
                translated_questions = self._translate_questions(
                    base_questions,
                    language
                )
                multilingual_questions[language] = translated_questions
        
        return multilingual_questions
    
    def _translate_questions(
        self,
        questions: List[Dict[str, Any]],
        target_language: str
    ) -> List[Dict[str, Any]]:
        """Translate questions to the target language."""
        translated = []
        language_data = self.language_mappings[target_language]
        
        for question in questions:
            translated_question = question.copy()
            
            # Translate question text using templates
            template_key = question.get('type', 'general')
            if template_key in language_data['templates']:
                template = language_data['templates'][template_key]
                translated_text = self._apply_template(
                    template,
                    question,
                    language_data['terms']
                )
                translated_question['text'] = translated_text
            
            # Translate any additional text fields
            if 'explanation' in question:
                translated_question['explanation'] = self._translate_text(
                    question['explanation'],
                    language_data['terms']
                )
            
            translated.append(translated_question)
        
        return translated
    
    def _apply_template(
        self,
        template: str,
        question: Dict[str, Any],
        terms: Dict[str, str]
    ) -> str:
        """Apply language template with translated terms."""
        # Get template variables
        variables = {}
        
        if 'category' in question:
            variables['category'] = self._translate_text(
                question['category'],
                terms
            )
        
        if 'factors' in question:
            factors = question['factors']
            if 'lord' in factors:
                variables['lord'] = self._translate_text(
                    factors['lord'],
                    terms
                )
            if 'aspect' in factors:
                variables['aspect'] = self._translate_text(
                    factors['aspect'],
                    terms
                )
            if 'house_significations' in factors:
                variables['house_significations'] = self._translate_text(
                    factors['house_significations'],
                    terms
                )
            if 'planets' in factors:
                variables['planets'] = ', '.join(
                    self._translate_text(p, terms)
                    for p in factors['planets']
                )
        
        # Apply variables to template
        return template.format(**variables)
    
    def _translate_text(self, text: str, terms: Dict[str, str]) -> str:
        """Translate text using term mappings."""
        translated = text
        
        # Replace terms with their translations
        for term, translation in terms.items():
            translated = translated.replace(term, translation)
        
        return translated 