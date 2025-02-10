def check_training_status(training_request: object=None):
    'Check feedback data and determine if retraining is needed.'
    from abacusai import ApiClient
    import json
    from datetime import datetime
    try:
        client = ApiClient()
        feedback_fg = client.describe_feature_group_by_table_name('BirthTimeRectification_Feedback')
        feedback_data = feedback_fg.load_as_pandas()
        ml_training_fg = client.describe_feature_group_by_table_name('BirthTimeRectification_ML_Training')
        current_training_data = ml_training_fg.load_as_pandas()
        new_records = (len(feedback_data) - len(current_training_data))
        should_retrain = (new_records >= 20)
        return {'should_retrain': should_retrain, 'new_records': new_records, 'feedback_count': len(feedback_data), 'training_count': len(current_training_data), 'message': f"Found {new_records} new records. {('Retraining recommended.' if should_retrain else 'No retraining needed.')}"}
    except Exception as e:
        return {'should_retrain': False, 'new_records': 0, 'feedback_count': 0, 'training_count': 0, 'message': f'Error checking training status: {str(e)}'}