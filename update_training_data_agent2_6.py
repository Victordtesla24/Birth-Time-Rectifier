def update_training_data(should_retrain: object, new_records: object):
    'Update ML training data if needed.'
    from abacusai import ApiClient
    import json
    try:
        if (not should_retrain):
            return {'status': 'skipped', 'message': 'No update needed', 'training_data_version': None}
        client = ApiClient()
        ml_training_fg = client.describe_feature_group_by_table_name('BirthTimeRectification_ML_Training')
        new_version = client.create_feature_group_version(ml_training_fg.feature_group_id)
        new_version.wait_for_materialization()
        return {'status': 'success', 'message': f'Updated training data with {new_records} new records', 'training_data_version': new_version.feature_group_version}
    except Exception as e:
        return {'status': 'error', 'message': f'Error updating training data: {str(e)}', 'training_data_version': None}