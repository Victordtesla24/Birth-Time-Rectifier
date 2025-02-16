"""Enhanced data preprocessing module."""

from typing import Dict, Any, List, Optional, Union, Tuple
import numpy as np
from datetime import datetime
import logging
import json
from pathlib import Path
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
from sklearn.impute import SimpleImputer
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.decomposition import PCA

logger = logging.getLogger(__name__)

class DataPreprocessor:
    """Enhanced data preprocessing for birth time rectification."""
    
    def __init__(self):
        """Initialize data preprocessor."""
        self.preprocessing_rules = self._load_preprocessing_rules()
        self.scalers = {
            "standard": StandardScaler(),
            "minmax": MinMaxScaler(),
            "robust": RobustScaler()
        }
        self.imputers = {
            "mean": SimpleImputer(strategy="mean"),
            "median": SimpleImputer(strategy="median"),
            "most_frequent": SimpleImputer(strategy="most_frequent")
        }
        self.feature_selector = SelectKBest(score_func=f_classif)
        self.pca = PCA(n_components=0.95)  # Keep 95% of variance
        self.preprocessing_metrics = {
            "total_processed": 0,
            "missing_values": 0,
            "outliers_detected": 0,
            "features_selected": 0
        }
    
    def _load_preprocessing_rules(self) -> Dict[str, Any]:
        """Load preprocessing rules from configuration."""
        rules_path = Path(__file__).parent / "preprocessing_rules.json"
        if rules_path.exists():
            with open(rules_path, "r") as f:
                return json.load(f)
        return {
            "birth_data": {
                "required_fields": ["date", "time", "latitude", "longitude"],
                "date_format": "%Y-%m-%d",
                "time_format": "%H:%M:%S",
                "coordinate_ranges": {
                    "latitude": [-90, 90],
                    "longitude": [-180, 180]
                },
                "scaling": "standard"
            },
            "events": {
                "required_fields": ["type", "time", "description"],
                "categorical_fields": ["type"],
                "numerical_fields": ["intensity"],
                "text_fields": ["description"],
                "scaling": "minmax"
            },
            "planetary": {
                "required_fields": [
                    "Sun", "Moon", "Mars", "Mercury",
                    "Jupiter", "Venus", "Saturn"
                ],
                "position_range": [0, 360],
                "scaling": "robust"
            }
        }
    
    def preprocess_data(
        self,
        data: Dict[str, Any],
        data_type: str,
        feature_selection: bool = True,
        dimensionality_reduction: bool = False
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Preprocess data with advanced techniques."""
        try:
            # Validate input
            if not self._validate_input(data, data_type):
                raise ValueError(f"Invalid input data for type: {data_type}")
            
            # Initialize preprocessing info
            preprocessing_info = {
                "missing_values": {},
                "outliers": {},
                "selected_features": [],
                "transformations": []
            }
            
            # Handle missing values
            data, missing_info = self._handle_missing_values(data, data_type)
            preprocessing_info["missing_values"] = missing_info
            
            # Detect and handle outliers
            data, outlier_info = self._handle_outliers(data, data_type)
            preprocessing_info["outliers"] = outlier_info
            
            # Convert categorical variables
            data = self._encode_categorical_variables(data, data_type)
            preprocessing_info["transformations"].append("categorical_encoding")
            
            # Scale numerical features
            data = self._scale_features(data, data_type)
            preprocessing_info["transformations"].append("feature_scaling")
            
            # Feature selection if requested
            if feature_selection:
                data, selected_features = self._select_features(data, data_type)
                preprocessing_info["selected_features"] = selected_features
            
            # Dimensionality reduction if requested
            if dimensionality_reduction:
                data = self._reduce_dimensionality(data)
                preprocessing_info["transformations"].append("dimensionality_reduction")
            
            # Update metrics
            self._update_metrics(preprocessing_info)
            
            return data, preprocessing_info
            
        except Exception as e:
            logger.error(f"Error in data preprocessing: {str(e)}")
            raise
    
    def _validate_input(self, data: Dict[str, Any], data_type: str) -> bool:
        """Validate input data against rules."""
        if data_type not in self.preprocessing_rules:
            return False
        
        rules = self.preprocessing_rules[data_type]
        required_fields = rules["required_fields"]
        
        # Check required fields
        if not all(field in data for field in required_fields):
            return False
        
        # Validate date/time formats for birth data
        if data_type == "birth_data":
            try:
                datetime.strptime(data["date"], rules["date_format"])
                datetime.strptime(data["time"], rules["time_format"])
            except ValueError:
                return False
            
            # Validate coordinates
            lat_range = rules["coordinate_ranges"]["latitude"]
            lon_range = rules["coordinate_ranges"]["longitude"]
            
            if not (lat_range[0] <= data["latitude"] <= lat_range[1]):
                return False
            if not (lon_range[0] <= data["longitude"] <= lon_range[1]):
                return False
        
        # Validate planetary positions
        elif data_type == "planetary":
            position_range = rules["position_range"]
            return all(
                position_range[0] <= pos <= position_range[1]
                for pos in data.values()
            )
        
        return True
    
    def _handle_missing_values(
        self,
        data: Dict[str, Any],
        data_type: str
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Handle missing values with appropriate strategies."""
        missing_info = {
            "total_missing": 0,
            "imputed_fields": {}
        }
        
        if data_type == "events":
            # Handle numerical fields
            numerical_fields = self.preprocessing_rules[data_type]["numerical_fields"]
            for field in numerical_fields:
                if field in data and data[field] is None:
                    imputer = self.imputers["mean"]
                    data[field] = imputer.fit_transform([[0]])[0][0]
                    missing_info["imputed_fields"][field] = "mean"
                    missing_info["total_missing"] += 1
            
            # Handle categorical fields
            categorical_fields = self.preprocessing_rules[data_type]["categorical_fields"]
            for field in categorical_fields:
                if field in data and data[field] is None:
                    imputer = self.imputers["most_frequent"]
                    data[field] = imputer.fit_transform([[""]])[0][0]
                    missing_info["imputed_fields"][field] = "most_frequent"
                    missing_info["total_missing"] += 1
        
        elif data_type == "planetary":
            # Interpolate missing planetary positions
            for planet in self.preprocessing_rules[data_type]["required_fields"]:
                if planet not in data or data[planet] is None:
                    imputer = self.imputers["median"]
                    data[planet] = imputer.fit_transform([[0]])[0][0]
                    missing_info["imputed_fields"][planet] = "median"
                    missing_info["total_missing"] += 1
        
        return data, missing_info
    
    def _handle_outliers(
        self,
        data: Dict[str, Any],
        data_type: str
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Detect and handle outliers."""
        outlier_info = {
            "total_outliers": 0,
            "outlier_fields": {}
        }
        
        if data_type == "events":
            numerical_fields = self.preprocessing_rules[data_type]["numerical_fields"]
            for field in numerical_fields:
                if field in data:
                    value = data[field]
                    if self._is_outlier(value):
                        data[field] = self._clip_outlier(value)
                        outlier_info["outlier_fields"][field] = value
                        outlier_info["total_outliers"] += 1
        
        elif data_type == "planetary":
            position_range = self.preprocessing_rules[data_type]["position_range"]
            for planet, position in data.items():
                if position < position_range[0] or position > position_range[1]:
                    data[planet] = self._normalize_position(position)
                    outlier_info["outlier_fields"][planet] = position
                    outlier_info["total_outliers"] += 1
        
        return data, outlier_info
    
    def _encode_categorical_variables(
        self,
        data: Dict[str, Any],
        data_type: str
    ) -> Dict[str, Any]:
        """Encode categorical variables."""
        if data_type == "events":
            categorical_fields = self.preprocessing_rules[data_type]["categorical_fields"]
            for field in categorical_fields:
                if field in data:
                    # Simple label encoding for now
                    # Could be enhanced with one-hot encoding if needed
                    data[f"{field}_encoded"] = hash(str(data[field])) % 100
        
        return data
    
    def _scale_features(
        self,
        data: Dict[str, Any],
        data_type: str
    ) -> Dict[str, Any]:
        """Scale numerical features."""
        scaling_type = self.preprocessing_rules[data_type]["scaling"]
        scaler = self.scalers[scaling_type]
        
        if data_type == "birth_data":
            # Scale coordinates
            coords = np.array([[data["latitude"], data["longitude"]]])
            scaled_coords = scaler.fit_transform(coords)
            data["latitude_scaled"] = scaled_coords[0][0]
            data["longitude_scaled"] = scaled_coords[0][1]
        
        elif data_type == "events":
            numerical_fields = self.preprocessing_rules[data_type]["numerical_fields"]
            for field in numerical_fields:
                if field in data:
                    value = np.array([[data[field]]])
                    data[f"{field}_scaled"] = scaler.fit_transform(value)[0][0]
        
        elif data_type == "planetary":
            positions = np.array([list(data.values())])
            scaled_positions = scaler.fit_transform(positions)
            for i, planet in enumerate(data.keys()):
                data[f"{planet}_scaled"] = scaled_positions[0][i]
        
        return data
    
    def _select_features(
        self,
        data: Dict[str, Any],
        data_type: str
    ) -> Tuple[Dict[str, Any], List[str]]:
        """Select most important features."""
        if data_type == "events":
            numerical_fields = self.preprocessing_rules[data_type]["numerical_fields"]
            features = np.array([[data[f"{field}_scaled"] for field in numerical_fields]])
            selected = self.feature_selector.fit_transform(features, [1])  # Dummy target
            
            selected_features = [
                numerical_fields[i]
                for i in range(len(numerical_fields))
                if self.feature_selector.get_support()[i]
            ]
            
            # Keep only selected features
            for field in numerical_fields:
                if field not in selected_features:
                    del data[f"{field}_scaled"]
            
            return data, selected_features
        
        return data, []
    
    def _reduce_dimensionality(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Reduce dimensionality of scaled features."""
        scaled_features = [
            value
            for key, value in data.items()
            if key.endswith("_scaled")
        ]
        
        if scaled_features:
            features = np.array([scaled_features])
            reduced = self.pca.fit_transform(features)
            
            # Add reduced features
            for i in range(reduced.shape[1]):
                data[f"pca_component_{i+1}"] = reduced[0][i]
            
            # Remove original scaled features
            data = {
                key: value
                for key, value in data.items()
                if not key.endswith("_scaled")
            }
        
        return data
    
    def _is_outlier(self, value: float, threshold: float = 3.0) -> bool:
        """Check if a value is an outlier using z-score."""
        return abs(value) > threshold
    
    def _clip_outlier(self, value: float, threshold: float = 3.0) -> float:
        """Clip outlier value to threshold."""
        return max(min(value, threshold), -threshold)
    
    def _normalize_position(self, position: float) -> float:
        """Normalize planetary position to [0, 360) range."""
        return position % 360
    
    def _update_metrics(self, preprocessing_info: Dict[str, Any]) -> None:
        """Update preprocessing metrics."""
        self.preprocessing_metrics["total_processed"] += 1
        self.preprocessing_metrics["missing_values"] += preprocessing_info["missing_values"]["total_missing"]
        self.preprocessing_metrics["outliers_detected"] += preprocessing_info["outliers"]["total_outliers"]
        self.preprocessing_metrics["features_selected"] += len(preprocessing_info["selected_features"]) 