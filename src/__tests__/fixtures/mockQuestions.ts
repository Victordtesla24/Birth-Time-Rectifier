export const mockQuestions = [
  {
    id: 1,
    text: 'What time of day were you born?',
    type: 'select',
    options: [
      { value: 'morning', label: 'Morning (6 AM - 12 PM)' },
      { value: 'afternoon', label: 'Afternoon (12 PM - 6 PM)' },
      { value: 'evening', label: 'Evening (6 PM - 12 AM)' },
      { value: 'night', label: 'Night (12 AM - 6 AM)' }
    ]
  },
  {
    id: 2,
    text: 'Do you know your birth time with certainty?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'approximate', label: 'I have an approximate time' }
    ]
  },
  {
    id: 3,
    text: 'What is your confidence level in the birth time?',
    type: 'slider',
    min: 0,
    max: 100,
    step: 10,
    defaultValue: 50
  }
]; 