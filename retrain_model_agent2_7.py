def retrain_model(status: object, training_data_version: object):
    'Retrain the model if data was updated.'
    from abacusai import ApiClient
    try:
        if ((status != 'success') or (not training_data_version)):
            return {'status': 'skipped', 'message': 'No retraining needed', 'agent_version': None}
        client = ApiClient()
        updated_agent = client.retrain_model(model_id='624c32ff6')
        return {'status': 'success', 'message': 'Model retrained successfully', 'agent_version': updated_agent.latest_agent_version.agent_version}
    except Exception as e:
        return {'status': 'error', 'message': f'Error retraining model: {str(e)}', 'agent_version': None}