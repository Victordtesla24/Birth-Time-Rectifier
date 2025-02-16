# Birth Time Rectifier

A modern web application for rectifying birth times using Vedic astrology principles and machine learning.

## Features

- Interactive birth chart visualization
- Dynamic questionnaire generation
- Real-time confidence scoring
- Machine learning-based pattern recognition
- Responsive and accessible UI

## Tech Stack

- React with TypeScript
- Material-UI for components
- D3.js for chart visualization
- Jest and React Testing Library for testing

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/birth-time-rectifier.git
cd birth-time-rectifier
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at http://localhost:3000.

### Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

## Project Structure

```
src/
├── frontend/
│   ├── components/
│   │   ├── chart/           # Chart visualization components
│   │   └── rectification/   # Birth time rectification components
│   ├── services/            # API client and services
│   ├── tests/              # Test files
│   └── types/              # TypeScript type definitions
├── shared/
│   └── types/              # Shared type definitions
└── index.ts                # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Swiss Ephemeris](https://www.astro.com/swisseph/) for astronomical calculations
- [Krishnamurti Paddhati](https://en.wikipedia.org/wiki/Krishnamurti_Paddhati) for astrological principles
- [D3.js](https://d3js.org/) for visualization capabilities 