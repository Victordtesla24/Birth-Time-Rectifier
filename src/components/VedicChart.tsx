import React from 'react';
import { Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import p5 from 'p5';

const CHART_SIZE = 400;
const ZODIAC_SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const PLANETS = {
    SUN: { symbol: '☉', name: 'Sun', color: '#FFB900', debColor: '#964B00', abbreviation: 'Su' },
    MOON: { symbol: '☽', name: 'Moon', color: '#C0C0C0', debColor: '#808080', abbreviation: 'Mo' },
    MARS: { symbol: '♂', name: 'Mars', color: '#FF4444', debColor: '#8B0000', abbreviation: 'Ma' },
    MERCURY: { symbol: '☿', name: 'Mercury', color: '#33CC33', debColor: '#006400', abbreviation: 'Me' },
    JUPITER: { symbol: '♃', name: 'Jupiter', color: '#FFFF00', debColor: '#BDB76B', abbreviation: 'Ju' },
    VENUS: { symbol: '♀', name: 'Venus', color: '#FF69B4', debColor: '#C71585', abbreviation: 'Ve' },
    SATURN: { symbol: '♄', name: 'Saturn', color: '#0066CC', debColor: '#191970', abbreviation: 'Sa' },
    RAHU: { symbol: '☊', name: 'Rahu', color: '#666666', debColor: '#363636', abbreviation: 'Ra' },
    KETU: { symbol: '☋', name: 'Ketu', color: '#666666', debColor: '#363636', abbreviation: 'Ke' },
    URANUS: { symbol: '♅', name: 'Uranus', color: '#4B0082', debColor: '#2E0854', abbreviation: 'Ur' },
    NEPTUNE: { symbol: '♆', name: 'Neptune', color: '#00FFFF', debColor: '#008B8B', abbreviation: 'Ne' },
    PLUTO: { symbol: '♇', name: 'Pluto', color: '#800080', debColor: '#4B0082', abbreviation: 'Pl' }
};

const isDebilitated = (planet, degree) => {
    // Add debilitation degrees for each planet
    const debDegrees = {
        SUN: [190, 191], // Example: Sun debilitated in Libra
        MOON: [200, 201], // Example: Moon debilitated in Scorpio
        // Add other planets' debilitation degrees
    };
    return debDegrees[planet]?.includes(Math.floor(degree));
};

const isRetrograde = (planet, planetaryPositions) => {
    return planetaryPositions[planet]?.isRetrograde;
};

const formatDegree = (degree) => {
    const deg = Math.floor(degree);
    const min = Math.floor((degree - deg) * 60);
    return `${deg}°${min}'`;
};

class VedicChartEnhancer {
  constructor(container, data) {
    this.sketch = new p5((p) => {
      p.setup = () => this.setup(p);
      p.draw = () => this.draw(p);
    }, container);
    this.data = data;
    this.style = new VedicStyle(this.sketch);
  }

  setup(p) {
    p.createCanvas(800, 800);
    p.background(250);
    this.style.initializeStyles();
  }

  draw(p) {
    this.drawChartFrame(p);
    this.plotPlanets(p);
    this.renderAspects(p);
    if (this.data.showDivisionalCharts) {
      this.showDivisionalCharts(p);
    }
  }

  drawChartFrame(p) {
    // South Indian style chart frame
    p.push();
    p.translate(p.width/2, p.height/2);
    
    // Draw main square
    p.stroke(0);
    p.noFill();
    p.rectMode(p.CENTER);
    p.rect(0, 0, 600, 600);
    
    // Draw inner divisions
    p.line(-200, -300, -200, 300);
    p.line(200, -300, 200, 300);
    p.line(-300, -200, 300, -200);
    p.line(-300, 200, 300, 200);
    
    this.style.addZodiacSymbols(p);
    this.style.renderDegreeMarkers(p);
    p.pop();
  }

  plotPlanets(p) {
    if (!this.data.positions) return;
    
    p.push();
    p.translate(p.width/2, p.height/2);
    
    Object.entries(this.data.positions).forEach(([planet, pos]) => {
      const house = Math.floor(pos.longitude / 30);
      const x = this.getHouseX(house);
      const y = this.getHouseY(house);
      
      this.style.drawPlanetSymbol(p, planet, x, y);
      this.style.showDegrees(p, pos.longitude, x, y + 20);
      
      if (pos.isRetrograde) {
        this.style.indicateRetrograde(p, x, y - 20);
      }
    });
    
    p.pop();
  }

  renderAspects(p) {
    if (!this.data.aspects) return;
    
    p.push();
    p.translate(p.width/2, p.height/2);
    
    this.data.aspects.forEach(aspect => {
      const pos1 = this.data.positions[aspect.planet1];
      const pos2 = this.data.positions[aspect.planet2];
      
      if (pos1 && pos2) {
        const house1 = Math.floor(pos1.longitude / 30);
        const house2 = Math.floor(pos2.longitude / 30);
        
        const x1 = this.getHouseX(house1);
        const y1 = this.getHouseY(house1);
        const x2 = this.getHouseX(house2);
        const y2 = this.getHouseY(house2);
        
        this.style.drawAspectLine(p, x1, y1, x2, y2, aspect.type);
      }
    });
    
    p.pop();
  }

  getHouseX(house) {
    const col = house % 3;
    return (col - 1) * 200;
  }

  getHouseY(house) {
    const row = Math.floor(house / 3);
    return (row - 1) * 200;
  }
}

class VedicStyle {
  constructor(sketch) {
    this.sketch = sketch;
    this.planetSymbols = {
      SUN: '☉',
      MOON: '☽',
      MARS: '♂',
      MERCURY: '☿',
      JUPITER: '♃',
      VENUS: '♀',
      SATURN: '♄',
      RAHU: '☊',
      KETU: '☋'
    };
    this.zodiacSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
  }

  initializeStyles() {
    this.sketch.textAlign(this.sketch.CENTER, this.sketch.CENTER);
    this.sketch.textSize(16);
  }

  drawPlanetSymbol(p, planet, x, y) {
    p.fill(0);
    p.noStroke();
    p.text(this.planetSymbols[planet], x, y);
  }

  drawAspectLine(p, x1, y1, x2, y2, aspectType) {
    p.stroke(this.getAspectColor(aspectType));
    p.strokeWeight(1);
    p.line(x1, y1, x2, y2);
  }

  getAspectColor(aspectType) {
    const colors = {
      conjunction: '#FF0000',
      trine: '#00FF00',
      square: '#FF00FF',
      opposition: '#0000FF',
      sextile: '#00FFFF'
    };
    return colors[aspectType] || '#000000';
  }
}

export const VedicChart = ({ chartData, onContinue }) => {
    if (!chartData) return (
        <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" align="center" gutterBottom>
                Loading Birth Chart Analysis...
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        </Paper>
    );

    const {
        ascendant = 0,
        planetaryPositions = {},
        houses = {},
        confidence_score = 0,
        rectified_time = ''
    } = chartData;

    const renderPlanetaryPositionsTable = () => (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Planet</TableCell>
                        <TableCell>Position</TableCell>
                        <TableCell>House</TableCell>
                        <TableCell>Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(planetaryPositions).map(([planet, data]) => (
                        <TableRow key={planet}>
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography sx={{ color: PLANETS[planet]?.color }}>
                                        {PLANETS[planet]?.symbol}
                                    </Typography>
                                    <Typography>{PLANETS[planet]?.name}</Typography>
                                </Box>
                            </TableCell>
                            <TableCell>{formatDegree(data.longitude)}</TableCell>
                            <TableCell>{Math.floor(data.longitude / 30) + 1}</TableCell>
                            <TableCell>
                                {data.isRetrograde ? 'Retrograde' : ''}
                                {isDebilitated(planet, data.longitude) ? ' Debilitated' : ''}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom align="center">
                Kundli & Planetary Position
            </Typography>
            
            <Grid container spacing={3}>
                {/* Charts Section */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Lagna Chart</Typography>
                    {/* Existing chart rendering code */}
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Navamsa Chart</Typography>
                    {/* Navamsa chart rendering code */}
                </Grid>

                {/* Analysis Section */}
                <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle1">
                                    Confidence Score: {Math.round(confidence_score * 100)}%
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle1">
                                    Rectified Time: {rectified_time}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={onContinue}
                                >
                                    Continue to Questionnaire
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Planetary Positions Table */}
                <Grid item xs={12}>
                    {renderPlanetaryPositionsTable()}
                </Grid>
            </Grid>
        </Paper>
    );
};

export { VedicChartEnhancer, VedicStyle }; 