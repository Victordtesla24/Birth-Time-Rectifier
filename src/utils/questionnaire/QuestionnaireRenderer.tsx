import type p5 from 'p5';
import type { Colors } from '../chart/types/visualization';
import type { Question, QuestionnaireSection } from './QuestionnaireGenerator';

export interface QuestionnaireState {
    currentSection: number;
    answers: Record<string, any>;
    isComplete: boolean;
    validationErrors: Record<string, string>;
}

export class QuestionnaireRenderer {
    private sketch: p5;
    private colors: Colors;
    private sections: QuestionnaireSection[];
    private state: QuestionnaireState;
    private onChange: (answers: Record<string, any>) => void;
    
    constructor(
        sketch: p5,
        colors: Colors,
        sections: QuestionnaireSection[],
        onChange: (answers: Record<string, any>) => void
    ) {
        this.sketch = sketch;
        this.colors = colors;
        this.sections = sections;
        this.onChange = onChange;
        
        this.state = {
            currentSection: 0,
            answers: {},
            isComplete: false,
            validationErrors: {}
        };
    }
    
    public draw(): void {
        const currentSection = this.sections[this.state.currentSection];
        if (!currentSection) return;
        
        this.sketch.push();
        
        // Draw section header
        this.drawSectionHeader(currentSection);
        
        // Draw questions
        this.drawQuestions(currentSection.questions);
        
        // Draw navigation
        this.drawNavigation();
        
        // Draw progress indicator
        this.drawProgress();
        
        this.sketch.pop();
    }
    
    private drawSectionHeader(section: QuestionnaireSection): void {
        const headerY = 50;
        
        // Draw title
        this.sketch.fill(this.colors.text);
        this.sketch.noStroke();
        this.sketch.textSize(24);
        this.sketch.textAlign(this.sketch.CENTER, this.sketch.TOP);
        this.sketch.text(section.title, this.sketch.width / 2, headerY);
        
        // Draw description
        this.sketch.textSize(16);
        this.sketch.text(section.description, this.sketch.width / 2, headerY + 40);
        
        // Draw confidence indicator
        const confidenceColor = this.getConfidenceColor(section.confidence);
        this.sketch.fill(confidenceColor);
        this.sketch.noStroke();
        this.sketch.rect(20, headerY, 10, 40);
    }
    
    private drawQuestions(questions: Question[]): void {
        let y = 150;
        const spacing = 80;
        
        questions.forEach(question => {
            // Draw question text
            this.sketch.fill(this.colors.text);
            this.sketch.noStroke();
            this.sketch.textSize(16);
            this.sketch.textAlign(this.sketch.LEFT, this.sketch.TOP);
            this.sketch.text(question.text, 50, y);
            
            // Draw input field based on question type
            this.drawQuestionInput(question, y + 30);
            
            // Draw validation error if any
            if (this.state.validationErrors[question.id]) {
                this.sketch.fill(this.colors.low);
                this.sketch.textSize(12);
                this.sketch.text(this.state.validationErrors[question.id], 50, y + 60);
            }
            
            y += spacing;
        });
    }
    
    private drawQuestionInput(question: Question, y: number): void {
        const inputX = 50;
        const inputWidth = this.sketch.width - 100;
        
        this.sketch.push();
        
        switch (question.type) {
            case 'multiple_choice':
                this.drawMultipleChoice(question, inputX, y, inputWidth);
                break;
            case 'scale':
                this.drawScale(question, inputX, y, inputWidth);
                break;
            case 'date':
            case 'time':
                this.drawDateTimeInput(question, inputX, y, inputWidth);
                break;
            case 'text':
                this.drawTextInput(question, inputX, y, inputWidth);
                break;
            case 'boolean':
                this.drawBooleanInput(question, inputX, y);
                break;
        }
        
        this.sketch.pop();
    }
    
    private drawMultipleChoice(question: Question, x: number, y: number, width: number): void {
        const optionHeight = 30;
        const currentValue = this.state.answers[question.id];
        
        question.options?.forEach((option, index) => {
            const optionY = y + (index * optionHeight);
            const isSelected = currentValue === option;
            
            // Draw option background
            this.sketch.fill(isSelected ? this.colors.highlight : this.colors.background);
            this.sketch.stroke(this.colors.text);
            this.sketch.strokeWeight(1);
            this.sketch.rect(x, optionY, width, optionHeight - 5, 5);
            
            // Draw option text
            this.sketch.fill(isSelected ? this.colors.background : this.colors.text);
            this.sketch.noStroke();
            this.sketch.textAlign(this.sketch.LEFT, this.sketch.CENTER);
            this.sketch.text(option, x + 15, optionY + optionHeight / 2);
        });
    }
    
    private drawScale(question: Question, x: number, y: number, width: number): void {
        const currentValue = this.state.answers[question.id] || question.min || 0;
        const min = question.min || 0;
        const max = question.max || 10;
        
        // Draw scale track
        this.sketch.stroke(this.colors.text);
        this.sketch.strokeWeight(2);
        this.sketch.line(x, y + 10, x + width, y + 10);
        
        // Draw scale markers
        for (let i = min; i <= max; i++) {
            const markerX = x + ((i - min) / (max - min)) * width;
            this.sketch.line(markerX, y + 5, markerX, y + 15);
            this.sketch.noStroke();
            this.sketch.textAlign(this.sketch.CENTER);
            this.sketch.text(i.toString(), markerX, y + 30);
        }
        
        // Draw current value marker
        const valueX = x + ((currentValue - min) / (max - min)) * width;
        this.sketch.fill(this.colors.highlight);
        this.sketch.noStroke();
        this.sketch.circle(valueX, y + 10, 20);
        
        this.sketch.fill(this.colors.background);
        this.sketch.textAlign(this.sketch.CENTER, this.sketch.CENTER);
        this.sketch.text(currentValue.toString(), valueX, y + 10);
    }
    
    private drawDateTimeInput(question: Question, x: number, y: number, width: number): void {
        const currentValue = this.state.answers[question.id] || '';
        
        // Draw input background
        this.sketch.fill(this.colors.background);
        this.sketch.stroke(this.colors.text);
        this.sketch.strokeWeight(1);
        this.sketch.rect(x, y, width, 30, 5);
        
        // Draw placeholder or value
        this.sketch.fill(this.colors.text);
        this.sketch.noStroke();
        this.sketch.textAlign(this.sketch.LEFT, this.sketch.CENTER);
        this.sketch.text(
            currentValue || `Enter ${question.type}...`,
            x + 10,
            y + 15
        );
    }
    
    private drawTextInput(question: Question, x: number, y: number, width: number): void {
        const currentValue = this.state.answers[question.id] || '';
        
        // Draw input background
        this.sketch.fill(this.colors.background);
        this.sketch.stroke(this.colors.text);
        this.sketch.strokeWeight(1);
        this.sketch.rect(x, y, width, 30, 5);
        
        // Draw placeholder or value
        this.sketch.fill(this.colors.text);
        this.sketch.noStroke();
        this.sketch.textAlign(this.sketch.LEFT, this.sketch.CENTER);
        this.sketch.text(
            currentValue || 'Enter text...',
            x + 10,
            y + 15
        );
    }
    
    private drawBooleanInput(question: Question, x: number, y: number): void {
        const currentValue = this.state.answers[question.id];
        
        // Draw Yes button
        this.sketch.fill(currentValue === true ? this.colors.highlight : this.colors.background);
        this.sketch.stroke(this.colors.text);
        this.sketch.strokeWeight(1);
        this.sketch.rect(x, y, 80, 30, 5);
        
        this.sketch.fill(currentValue === true ? this.colors.background : this.colors.text);
        this.sketch.noStroke();
        this.sketch.textAlign(this.sketch.CENTER, this.sketch.CENTER);
        this.sketch.text('Yes', x + 40, y + 15);
        
        // Draw No button
        this.sketch.fill(currentValue === false ? this.colors.highlight : this.colors.background);
        this.sketch.stroke(this.colors.text);
        this.sketch.strokeWeight(1);
        this.sketch.rect(x + 100, y, 80, 30, 5);
        
        this.sketch.fill(currentValue === false ? this.colors.background : this.colors.text);
        this.sketch.noStroke();
        this.sketch.textAlign(this.sketch.CENTER, this.sketch.CENTER);
        this.sketch.text('No', x + 140, y + 15);
    }
    
    private drawNavigation(): void {
        const buttonY = this.sketch.height - 80;
        const buttonWidth = 120;
        const buttonHeight = 40;
        
        // Draw Back button if not first section
        if (this.state.currentSection > 0) {
            this.sketch.fill(this.colors.background);
            this.sketch.stroke(this.colors.text);
            this.sketch.strokeWeight(1);
            this.sketch.rect(20, buttonY, buttonWidth, buttonHeight, 5);
            
            this.sketch.fill(this.colors.text);
            this.sketch.noStroke();
            this.sketch.textAlign(this.sketch.CENTER, this.sketch.CENTER);
            this.sketch.text('Back', 80, buttonY + 20);
        }
        
        // Draw Next/Complete button
        const isLastSection = this.state.currentSection === this.sections.length - 1;
        const buttonText = isLastSection ? 'Complete' : 'Next';
        
        this.sketch.fill(this.colors.highlight);
        this.sketch.noStroke();
        this.sketch.rect(
            this.sketch.width - buttonWidth - 20,
            buttonY,
            buttonWidth,
            buttonHeight,
            5
        );
        
        this.sketch.fill(this.colors.background);
        this.sketch.textAlign(this.sketch.CENTER, this.sketch.CENTER);
        this.sketch.text(
            buttonText,
            this.sketch.width - buttonWidth + 40,
            buttonY + 20
        );
    }
    
    private drawProgress(): void {
        const progressWidth = this.sketch.width - 40;
        const progressHeight = 4;
        const progressY = this.sketch.height - 20;
        
        // Draw background track
        this.sketch.fill(this.colors.background);
        this.sketch.stroke(this.colors.text);
        this.sketch.strokeWeight(1);
        this.sketch.rect(20, progressY, progressWidth, progressHeight);
        
        // Draw progress
        const progress = (this.state.currentSection + 1) / this.sections.length;
        this.sketch.fill(this.colors.highlight);
        this.sketch.noStroke();
        this.sketch.rect(20, progressY, progressWidth * progress, progressHeight);
        
        // Draw progress text
        this.sketch.fill(this.colors.text);
        this.sketch.textSize(12);
        this.sketch.textAlign(this.sketch.CENTER);
        this.sketch.text(
            `Section ${this.state.currentSection + 1} of ${this.sections.length}`,
            this.sketch.width / 2,
            progressY - 10
        );
    }
    
    private getConfidenceColor(confidence: number): string {
        if (confidence >= 0.8) return this.colors.high;
        if (confidence >= 0.6) return this.colors.medium;
        return this.colors.low;
    }
    
    public handleClick(mouseX: number, mouseY: number): void {
        const currentSection = this.sections[this.state.currentSection];
        if (!currentSection) return;
        
        // Handle question input clicks
        currentSection.questions.forEach((question, index) => {
            const questionY = 150 + (index * 80);
            this.handleQuestionClick(question, mouseX, mouseY, questionY);
        });
        
        // Handle navigation clicks
        this.handleNavigationClick(mouseX, mouseY);
    }
    
    private handleQuestionClick(
        question: Question,
        mouseX: number,
        mouseY: number,
        questionY: number
    ): void {
        const inputY = questionY + 30;
        
        switch (question.type) {
            case 'multiple_choice':
                this.handleMultipleChoiceClick(question, mouseX, mouseY, inputY);
                break;
            case 'scale':
                this.handleScaleClick(question, mouseX, mouseY, inputY);
                break;
            case 'boolean':
                this.handleBooleanClick(question, mouseX, mouseY, inputY);
                break;
        }
    }
    
    private handleMultipleChoiceClick(
        question: Question,
        mouseX: number,
        mouseY: number,
        inputY: number
    ): void {
        const optionHeight = 30;
        
        question.options?.forEach((option, index) => {
            const optionY = inputY + (index * optionHeight);
            if (
                mouseX >= 50 &&
                mouseX <= this.sketch.width - 50 &&
                mouseY >= optionY &&
                mouseY <= optionY + optionHeight - 5
            ) {
                this.updateAnswer(question.id, option);
            }
        });
    }
    
    private handleScaleClick(
        question: Question,
        mouseX: number,
        mouseY: number,
        inputY: number
    ): void {
        if (
            mouseX >= 50 &&
            mouseX <= this.sketch.width - 50 &&
            mouseY >= inputY &&
            mouseY <= inputY + 20
        ) {
            const min = question.min || 0;
            const max = question.max || 10;
            const value = Math.round(
                min + ((mouseX - 50) / (this.sketch.width - 100)) * (max - min)
            );
            this.updateAnswer(question.id, Math.max(min, Math.min(max, value)));
        }
    }
    
    private handleBooleanClick(
        question: Question,
        mouseX: number,
        mouseY: number,
        inputY: number
    ): void {
        if (mouseY >= inputY && mouseY <= inputY + 30) {
            // Yes button
            if (mouseX >= 50 && mouseX <= 130) {
                this.updateAnswer(question.id, true);
            }
            // No button
            else if (mouseX >= 150 && mouseX <= 230) {
                this.updateAnswer(question.id, false);
            }
        }
    }
    
    private handleNavigationClick(mouseX: number, mouseY: number): void {
        const buttonY = this.sketch.height - 80;
        
        // Back button
        if (
            this.state.currentSection > 0 &&
            mouseX >= 20 &&
            mouseX <= 140 &&
            mouseY >= buttonY &&
            mouseY <= buttonY + 40
        ) {
            this.state.currentSection--;
        }
        
        // Next/Complete button
        if (
            mouseX >= this.sketch.width - 140 &&
            mouseX <= this.sketch.width - 20 &&
            mouseY >= buttonY &&
            mouseY <= buttonY + 40
        ) {
            if (this.validateCurrentSection()) {
                if (this.state.currentSection < this.sections.length - 1) {
                    this.state.currentSection++;
                } else {
                    this.complete();
                }
            }
        }
    }
    
    private updateAnswer(questionId: string, value: any): void {
        this.state.answers[questionId] = value;
        this.onChange(this.state.answers);
        
        // Clear validation error if exists
        if (this.state.validationErrors[questionId]) {
            delete this.state.validationErrors[questionId];
        }
    }
    
    private validateCurrentSection(): boolean {
        const currentSection = this.sections[this.state.currentSection];
        if (!currentSection) return false;
        
        const errors: Record<string, string> = {};
        
        currentSection.questions.forEach(question => {
            if (question.required && !this.state.answers[question.id]) {
                errors[question.id] = 'This field is required';
            }
        });
        
        this.state.validationErrors = errors;
        return Object.keys(errors).length === 0;
    }
    
    private complete(): void {
        this.state.isComplete = true;
        this.onChange(this.state.answers);
    }
    
    public isComplete(): boolean {
        return this.state.isComplete;
    }
    
    public getAnswers(): Record<string, any> {
        return this.state.answers;
    }
} 