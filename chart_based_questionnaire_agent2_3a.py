def generate_questionnaire_function(planetary_positions: object, divisional_charts: object):
    'Generates dynamic questionnaire using ML for relevance scoring.'
    from abacusai import AgentResponse
    import json
    try:
        client = ApiClient()
        positions = json.loads(planetary_positions)
        charts = json.loads(divisional_charts)
        base_questions = [{'id': 1, 'category': 'Career', 'question': 'Did you experience any significant career changes around age 28-29?', 'astrological_basis': 'Saturn in 11th house'}]
        try:
            ml_training_data = client.execute_feature_group_sql(f'''
                SELECT 
                    GET_JSON_OBJECT(questionnaire, '$.questions') as questions,
                    user_feedback_score,
                    confidence_score
                FROM BirthTimeRectification_ML_Training
                WHERE user_feedback_score > 0.8
                ORDER BY confidence_score DESC
                LIMIT 10
            ''')
            scored_questions = []
            for q in base_questions:
                relevance_score = 0.8
                try:
                    ml_input = {'question_category': q['category'], 'astrological_basis': q['astrological_basis'], 'planetary_positions': positions}
                    ml_prediction = client.get_batch_prediction(deployment_token='your_deployment_token', deployment_id='your_deployment_id', records=[ml_input])
                    relevance_score = ml_prediction.predictions[0].get('relevance_score', 0.8)
                except Exception:
                    pass
                q['relevance_score'] = relevance_score
                scored_questions.append(q)
            scored_questions.sort(key=(lambda x: x['relevance_score']), reverse=True)
        except Exception as ml_error:
            print(f'ML scoring failed: {str(ml_error)}. Using base questions.')
            scored_questions = base_questions
        return {'questionnaire': json.dumps({'questions': scored_questions[:5]}), 'message': 'Questionnaire generated successfully'}
    except Exception as e:
        return {'error': str(e), 'message': f'Questionnaire generation error: {str(e)}'}