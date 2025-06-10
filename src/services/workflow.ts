import { ApiClient } from './api';
import { FormManager } from './form';
import { VisualizationManager } from './visualization';

export class WorkflowService {
  private apiClient: ApiClient;
  private formManager: FormManager;
  private visualizationManager: VisualizationManager;

  constructor(
    apiClient: ApiClient,
    formManager: FormManager,
    visualizationManager: VisualizationManager
  ) {
    this.apiClient = apiClient;
    this.formManager = formManager;
    this.visualizationManager = visualizationManager;
  }

  async processBirthTimeRectification(formData: any) {
    // Validate form data
    this.formManager.setField('birthData', formData);
    if (!this.formManager.validateAll()) {
      throw new Error('Invalid form data');
    }

    // Get birth chart data
    const birthChartData = await this.apiClient.getBirthChart(formData);

    // Visualize birth chart
    this.visualizationManager.drawChart(birthChartData);

    // Rectify birth time
    const rectificationResult = await this.apiClient.rectifyBirthTime(formData);

    // Get insights for the rectified chart
    const chartInsights = await this.apiClient.getChartInsights(rectificationResult.chartId);

    return {
      birthChartData,
      rectificationResult,
      chartInsights,
    };
  }

  async processQuestionnaire(answers: any) {
    // Validate questionnaire answers
    this.formManager.setField('questionnaireAnswers', answers);
    if (!this.formManager.validateAll()) {
      throw new Error('Invalid questionnaire answers');
    }

    // Submit questionnaire
    const result = await this.apiClient.submitQuestionnaire(answers);

    return result;
  }

  cleanup() {
    this.formManager.reset();
    this.visualizationManager.cleanup();
  }
} 