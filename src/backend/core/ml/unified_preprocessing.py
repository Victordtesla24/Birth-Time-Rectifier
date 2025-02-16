"""
Unified Preprocessing Module
Combines data validation, geocoding, timezone resolution, and advanced ML preprocessing.
"""

from typing import Dict, Any, List, Optional, Union, Tuple
import numpy as np
import pandas as pd
from datetime import datetime
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
from sklearn.impute import SimpleImputer, KNNImputer
from sklearn.decomposition import PCA
from sklearn.feature_selection import SelectKBest, mutual_info_regression
from ..utils.error_handler import ErrorHandler
from ..models.data_schema import DataSchema
from ..models.birth_data import BirthData

class UnifiedDataPreprocessor:
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize unified preprocessor with all capabilities."""
        # Initialize error handling
        self.error_handler = ErrorHandler()
        self.config = config or {}
        
        # Initialize geocoding capabilities
        self.geolocator = Nominatim(user_agent="birth_time_rectifier", timeout=10)
        self.tf = TimezoneFinder()
        
        # Initialize ML preprocessing components
        self._initialize_components()
        self._load_preprocessing_rules()

    def _initialize_components(self):
        """Initialize ML preprocessing components."""
        # Scalers
        self.scalers = {
            'standard': StandardScaler(),
            'minmax': MinMaxScaler(),
            'robust': RobustScaler()
        }
        
        # Imputers
        self.imputers = {
            'simple': SimpleImputer(strategy='mean'),
            'knn': KNNImputer(n_neighbors=5),
            'categorical': SimpleImputer(strategy='most_frequent')
        }
        
        # Feature selection
        self.feature_selectors = {
            'pca': PCA(n_components=0.95),
            'mutual_info': SelectKBest(score_func=mutual_info_regression)
        }

    def _load_preprocessing_rules(self):
        """Load preprocessing rules and configurations."""
        # Implement rule loading logic
        pass

    # Birth Data Validation and Processing Methods
    def validate_time_format(self, time: str) -> None:
        """Validate time format (HH:MM)."""
        try:
            datetime.strptime(time, "%H:%M")
        except ValueError:
            raise ValueError(f"Invalid time format: {time}. Expected format: HH:MM (24-hour)")

    def validate_date_format(self, date: str) -> None:
        """Validate date format (YYYY-MM-DD)."""
        try:
            datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            raise ValueError(f"Invalid date format: {date}. Expected format: YYYY-MM-DD")

    def geocode_location(self, birth_data: BirthData) -> BirthData:
        """Geocode location and set coordinates."""
        try:
            location = self.geolocator.geocode(birth_data.place)
            if location:
                birth_data.latitude = location.latitude
                birth_data.longitude = location.longitude
                birth_data.timezone = self.get_timezone(birth_data.latitude, birth_data.longitude)
            else:
                raise ValueError(f"Could not geocode location: {birth_data.place}")
            return birth_data
        except Exception as e:
            if "timeout" in str(e).lower():
                raise ValueError(f"Geocoding service timeout. Please try again in a few moments. Details: {str(e)}")
            raise ValueError(f"Error geocoding location '{birth_data.place}': {str(e)}")

    def get_timezone(self, lat: float, lon: float) -> str:
        """Get timezone for given coordinates."""
        try:
            timezone = self.tf.timezone_at(lat=lat, lng=lon)
            return timezone if timezone else "UTC"
        except:
            return "UTC"  # Default to UTC if timezone lookup fails

    def preprocess_birth_data(self, birth_data: BirthData) -> BirthData:
        """Preprocess birth data with validation and geocoding."""
        try:
            # Validate formats
            self.validate_date_format(birth_data.date)
            self.validate_time_format(birth_data.time)
            
            # Geocode and get timezone
            birth_data = self.geocode_location(birth_data)
            
            return birth_data
            
        except Exception as e:
            raise ValueError(f"Error preprocessing birth data: {str(e)}")

    # Advanced ML Preprocessing Methods
    def preprocess_data(
        self,
        data: Union[pd.DataFrame, Dict[str, Any]],
        schema: Optional[DataSchema] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Preprocess input data using advanced ML techniques."""
        try:
            # Convert input to DataFrame if necessary
            df = self._to_dataframe(data)
            
            # Validate data against schema
            if schema:
                self._validate_against_schema(df, schema)
            
            # Apply preprocessing pipeline
            preprocessed_data = self._apply_preprocessing_pipeline(
                df,
                context
            )
            
            # Generate preprocessing metadata
            metadata = self._generate_preprocessing_metadata(
                df,
                preprocessed_data
            )
            
            return preprocessed_data, metadata
            
        except Exception as e:
            self.error_handler.handle_error(
                "Data preprocessing failed",
                str(e),
                severity="high"
            )
            return self._get_fallback_results(data)

    def _to_dataframe(
        self,
        data: Union[pd.DataFrame, Dict[str, Any]]
    ) -> pd.DataFrame:
        """Convert input data to pandas DataFrame."""
        if isinstance(data, pd.DataFrame):
            return data.copy()
        elif isinstance(data, dict):
            return pd.DataFrame.from_dict(data)
        else:
            raise ValueError("Unsupported data format")

    def _validate_against_schema(
        self,
        df: pd.DataFrame,
        schema: DataSchema
    ):
        """Validate DataFrame against provided schema."""
        try:
            # Check required columns
            missing_cols = set(schema.required_columns) - set(df.columns)
            if missing_cols:
                raise ValueError(f"Missing required columns: {missing_cols}")
            
            # Validate data types
            for col, dtype in schema.column_types.items():
                if col in df.columns:
                    if not np.issubdtype(df[col].dtype, dtype):
                        df[col] = df[col].astype(dtype)
            
            # Validate value ranges
            for col, range_info in schema.value_ranges.items():
                if col in df.columns:
                    self._validate_column_range(df[col], range_info)
            
        except Exception as e:
            self.error_handler.handle_error(
                "Schema validation failed",
                str(e),
                severity="high"
            )
            raise

    def _apply_preprocessing_pipeline(
        self,
        df: pd.DataFrame,
        context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Apply the preprocessing pipeline to the data."""
        try:
            # Handle missing values
            df_imputed = self._handle_missing_values(df)
            
            # Handle outliers
            df_cleaned = self._handle_outliers(df_imputed)
            
            # Feature engineering
            df_engineered = self._engineer_features(df_cleaned, context)
            
            # Feature scaling
            df_scaled = self._scale_features(df_engineered)
            
            # Feature selection
            df_selected = self._select_features(df_scaled, context)
            
            # Encode categorical variables
            df_encoded = self._encode_categorical(df_selected)
            
            # Time series preprocessing if applicable
            if self._is_time_series_data(df_encoded):
                df_processed = self._preprocess_time_series(df_encoded)
            else:
                df_processed = df_encoded
            
            return {
                'processed_data': df_processed,
                'feature_names': df_processed.columns.tolist(),
                'feature_types': self._get_feature_types(df_processed)
            }
            
        except Exception as e:
            self.error_handler.handle_error(
                "Preprocessing pipeline failed",
                str(e),
                severity="high"
            )
            raise

    def _handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Handle missing values using appropriate strategies."""
        try:
            # Identify columns with missing values
            missing_cols = df.columns[df.isnull().any()].tolist()
            
            if not missing_cols:
                return df
            
            result = df.copy()
            
            for col in missing_cols:
                if self._is_numerical(df[col]):
                    if self._missing_ratio(df[col]) < 0.1:
                        # Use KNN imputation for low missing ratio
                        result[col] = self.imputers['knn'].fit_transform(
                            df[[col]]
                        )
                    else:
                        # Use mean imputation for high missing ratio
                        result[col] = self.imputers['simple'].fit_transform(
                            df[[col]]
                        )
                else:
                    # Use mode imputation for categorical
                    result[col] = self.imputers['categorical'].fit_transform(
                        df[[col]]
                    )
            
            return result
            
        except Exception as e:
            self.error_handler.handle_error(
                "Missing value handling failed",
                str(e),
                severity="medium"
            )
            return df

    def _handle_outliers(self, df: pd.DataFrame) -> pd.DataFrame:
        """Handle outliers using robust methods."""
        try:
            result = df.copy()
            
            for col in df.select_dtypes(include=np.number).columns:
                # Calculate IQR
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                
                # Define bounds
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                
                # Handle outliers
                result[col] = df[col].clip(lower_bound, upper_bound)
            
            return result
            
        except Exception as e:
            self.error_handler.handle_error(
                "Outlier handling failed",
                str(e),
                severity="medium"
            )
            return df

    def _engineer_features(
        self,
        df: pd.DataFrame,
        context: Optional[Dict[str, Any]]
    ) -> pd.DataFrame:
        """Engineer new features based on existing ones."""
        try:
            result = df.copy()
            
            # Add interaction features
            if context and context.get('add_interactions', False):
                result = self._add_interaction_features(result)
            
            # Add polynomial features
            if context and context.get('add_polynomial', False):
                result = self._add_polynomial_features(result)
            
            # Add temporal features if time-based columns exist
            if self._has_temporal_columns(result):
                result = self._add_temporal_features(result)
            
            return result
            
        except Exception as e:
            self.error_handler.handle_error(
                "Feature engineering failed",
                str(e),
                severity="medium"
            )
            return df

    def _scale_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Scale numerical features using appropriate scalers."""
        try:
            result = df.copy()
            
            # Scale numerical columns
            numerical_cols = df.select_dtypes(include=np.number).columns
            
            if len(numerical_cols) == 0:
                return result
            
            # Use robust scaler for outlier-sensitive data
            scaler = self.scalers['robust']
            result[numerical_cols] = scaler.fit_transform(df[numerical_cols])
            
            return result
            
        except Exception as e:
            self.error_handler.handle_error(
                "Feature scaling failed",
                str(e),
                severity="medium"
            )
            return df

    def _select_features(
        self,
        df: pd.DataFrame,
        context: Optional[Dict[str, Any]]
    ) -> pd.DataFrame:
        """Select most important features using specified methods."""
        try:
            if not context or not context.get('feature_selection'):
                return df
            
            method = context['feature_selection'].get('method', 'mutual_info')
            n_features = context['feature_selection'].get('n_features', None)
            
            if method == 'pca':
                selector = self.feature_selectors['pca']
                if n_features:
                    selector.n_components = n_features
            else:
                selector = self.feature_selectors['mutual_info']
                if n_features:
                    selector.k = n_features
            
            # Apply feature selection
            numerical_cols = df.select_dtypes(include=np.number).columns
            if len(numerical_cols) > 0:
                selected_features = selector.fit_transform(df[numerical_cols])
                result = pd.DataFrame(
                    selected_features,
                    columns=[f'feature_{i}' for i in range(selected_features.shape[1])]
                )
                
                # Add back non-numerical columns
                for col in df.columns:
                    if col not in numerical_cols:
                        result[col] = df[col]
                
                return result
            
            return df
            
        except Exception as e:
            self.error_handler.handle_error(
                "Feature selection failed",
                str(e),
                severity="medium"
            )
            return df

    def _encode_categorical(self, df: pd.DataFrame) -> pd.DataFrame:
        """Encode categorical variables using appropriate methods."""
        try:
            result = df.copy()
            
            # Get categorical columns
            categorical_cols = df.select_dtypes(include=['object', 'category']).columns
            
            if len(categorical_cols) == 0:
                return result
            
            for col in categorical_cols:
                # Use one-hot encoding for low cardinality
                if df[col].nunique() < 10:
                    dummies = pd.get_dummies(df[col], prefix=col)
                    result = pd.concat([result, dummies], axis=1)
                    result.drop(col, axis=1, inplace=True)
                else:
                    # Use label encoding for high cardinality
                    result[col] = pd.factorize(df[col])[0]
            
            return result
            
        except Exception as e:
            self.error_handler.handle_error(
                "Categorical encoding failed",
                str(e),
                severity="medium"
            )
            return df

    def _generate_preprocessing_metadata(
        self,
        original_df: pd.DataFrame,
        preprocessed_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate metadata about the preprocessing steps."""
        return {
            'original_shape': original_df.shape,
            'processed_shape': preprocessed_data['processed_data'].shape,
            'feature_names': preprocessed_data['feature_names'],
            'feature_types': preprocessed_data['feature_types'],
            'preprocessing_steps': self._get_preprocessing_steps()
        }

    def _get_fallback_results(
        self,
        data: Union[pd.DataFrame, Dict[str, Any]]
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Get fallback results in case of preprocessing failure."""
        df = self._to_dataframe(data)
        return (
            {
                'processed_data': df,
                'feature_names': df.columns.tolist(),
                'feature_types': self._get_feature_types(df)
            },
            {
                'error': 'Preprocessing failed, using original data',
                'original_shape': df.shape
            }
        )

    # Helper Methods
    def _is_numerical(self, series: pd.Series) -> bool:
        """Check if a series is numerical."""
        return np.issubdtype(series.dtype, np.number)

    def _missing_ratio(self, series: pd.Series) -> float:
        """Calculate the ratio of missing values."""
        return series.isnull().mean()

    def _is_time_series_data(self, df: pd.DataFrame) -> bool:
        """Check if the data is time series."""
        return any(np.issubdtype(df[col].dtype, np.datetime64) for col in df.columns)

    def _has_temporal_columns(self, df: pd.DataFrame) -> bool:
        """Check if DataFrame has temporal columns."""
        return any(np.issubdtype(df[col].dtype, np.datetime64) for col in df.columns)

    def _get_feature_types(self, df: pd.DataFrame) -> Dict[str, str]:
        """Get types of features in the DataFrame."""
        return {col: str(df[col].dtype) for col in df.columns}

    def _get_preprocessing_steps(self) -> List[str]:
        """Get list of preprocessing steps applied."""
        return [
            'missing_value_imputation',
            'outlier_handling',
            'feature_engineering',
            'feature_scaling',
            'feature_selection',
            'categorical_encoding'
        ]

    def _validate_column_range(self, series: pd.Series, range_info: Dict[str, Any]):
        """Validate value ranges for a column."""
        if 'min' in range_info and series.min() < range_info['min']:
            raise ValueError(f"Values below minimum {range_info['min']} in column {series.name}")
        if 'max' in range_info and series.max() > range_info['max']:
            raise ValueError(f"Values above maximum {range_info['max']} in column {series.name}")

    def _add_interaction_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add interaction features between numerical columns."""
        numerical_cols = df.select_dtypes(include=np.number).columns
        result = df.copy()
        
        for i in range(len(numerical_cols)):
            for j in range(i + 1, len(numerical_cols)):
                col1, col2 = numerical_cols[i], numerical_cols[j]
                result[f'{col1}_{col2}_interaction'] = df[col1] * df[col2]
        
        return result

    def _add_polynomial_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add polynomial features for numerical columns."""
        numerical_cols = df.select_dtypes(include=np.number).columns
        result = df.copy()
        
        for col in numerical_cols:
            result[f'{col}_squared'] = df[col] ** 2
        
        return result

    def _add_temporal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add temporal features for datetime columns."""
        result = df.copy()
        
        for col in df.select_dtypes(include=np.datetime64).columns:
            result[f'{col}_year'] = df[col].dt.year
            result[f'{col}_month'] = df[col].dt.month
            result[f'{col}_day'] = df[col].dt.day
            result[f'{col}_dayofweek'] = df[col].dt.dayofweek
            
        return result 