class SketchManager {
  constructor() {
    // ... existing code ...
    this.sunShader = null;
    this.planets = [];
    this.orbitTrails = [];
    this.maxTrailPoints = 100;
    this.cameraZ = 0;
    this.targetCameraZ = 0;
    this.rotationX = 0;
    this.rotationY = 0;
    this.targetRotationX = 0;
    this.targetRotationY = 0;
    this.nebulaClouds = [];
    this.numNebulaClouds = 5;
    
    // Initialize nebula clouds
    for(let i = 0; i < this.numNebulaClouds; i++) {
      this.nebulaClouds.push({
        x: random(-width, width),
        y: random(-height, height),
        z: random(-1000, 1000),
        size: random(200, 400),
        color: color(
          random(100, 255),
          random(100, 255),
          random(200, 255),
          100
        )
      });
    }
  }

  preload() {
    // Load shaders
    this.sunShader = loadShader('shaders/sun.vert', 'shaders/sun.frag');
    
    // Initialize planets with realistic properties
    this.initializePlanets();
  }

  initializePlanets() {
    const planetData = [
      { name: 'Mercury', radius: 10, distance: 100, speed: 0.02, color: color(169, 169, 169) },
      { name: 'Venus', radius: 15, distance: 150, speed: 0.015, color: color(255, 198, 73) },
      { name: 'Earth', radius: 16, distance: 200, speed: 0.01, color: color(100, 149, 237) },
      { name: 'Mars', radius: 12, distance: 250, speed: 0.008, color: color(205, 127, 50) },
      { name: 'Jupiter', radius: 35, distance: 350, speed: 0.005, color: color(255, 223, 186) },
      { name: 'Saturn', radius: 30, distance: 450, speed: 0.004, color: color(238, 232, 205) },
      { name: 'Uranus', radius: 20, distance: 550, speed: 0.003, color: color(173, 216, 230) },
      { name: 'Neptune', radius: 19, distance: 650, speed: 0.002, color: color(0, 0, 128) }
    ];

    planetData.forEach(data => {
      this.planets.push({
        ...data,
        angle: random(TWO_PI),
        orbitTrail: []
      });
    });
  }

  draw() {
    background(0);
    
    // Update camera position
    this.updateCamera();
    
    // Apply camera transformations
    translate(width/2, height/2);
    rotateX(this.rotationX);
    rotateY(this.rotationY);
    translate(0, 0, this.cameraZ);
    
    // Draw nebula clouds
    this.drawNebulaClouds();
    
    // Draw stars with depth and parallax
    this.drawEnhancedStars();
    
    // Draw sun and planets
    this.drawSunAndPlanets();
  }

  updateCamera() {
    // Smooth camera movement
    this.cameraZ += (this.targetCameraZ - this.cameraZ) * 0.1;
    this.rotationX += (this.targetRotationX - this.rotationX) * 0.1;
    this.rotationY += (this.targetRotationY - this.rotationY) * 0.1;
    
    // Update camera based on mouse position
    this.targetRotationX = map(mouseY, 0, height, -PI/4, PI/4);
    this.targetRotationY = map(mouseX, 0, width, -PI/4, PI/4);
  }

  drawNebulaClouds() {
    this.nebulaClouds.forEach(cloud => {
      push();
      translate(cloud.x, cloud.y, cloud.z);
      
      // Create volumetric effect
      for(let i = 0; i < 5; i++) {
        let size = cloud.size * (1 - i * 0.1);
        let alpha = 100 * (1 - i * 0.2);
        fill(red(cloud.color), green(cloud.color), blue(cloud.color), alpha);
        noStroke();
        
        // Add wobble effect
        let wobble = sin(frameCount * 0.02 + i) * 10;
        ellipse(wobble, 0, size, size);
      }
      pop();
    });
  }

  drawEnhancedStars() {
    // Draw stars with depth and color variation
    this.stars.forEach(star => {
      push();
      translate(star.x, star.y, star.z);
      
      // Calculate star brightness based on z-position
      let brightness = map(star.z, -1000, 1000, 255, 100);
      let size = map(star.z, -1000, 1000, 3, 1);
      
      // Add twinkling effect
      let twinkle = sin(frameCount * 0.1 + star.x) * 50;
      brightness += twinkle;
      
      // Star color variation
      let starColor = color(
        brightness + random(-20, 20),
        brightness + random(-20, 20),
        brightness + random(-20, 20)
      );
      
      fill(starColor);
      noStroke();
      circle(0, 0, size);
      
      // Add glow effect
      for(let i = 2; i > 0; i--) {
        fill(red(starColor), green(starColor), blue(starColor), 50/i);
        circle(0, 0, size * (1 + i));
      }
      pop();
    });
  }

  drawSunAndPlanets() {
    // Draw sun
    push();
    shader(this.sunShader);
    this.sunShader.setUniform('uTime', millis());
    this.sunShader.setUniform('uProjectionMatrix', this._renderer.uPMatrix.mat4);
    this.sunShader.setUniform('uModelViewMatrix', this._renderer.uMVMatrix.mat4);
    sphere(50);
    resetShader();
    pop();

    // Update and draw planets
    this.updatePlanets();
    this.drawPlanets();
  }

  updatePlanets() {
    this.planets.forEach(planet => {
      // Update planet position
      planet.angle += planet.speed;
      const x = cos(planet.angle) * planet.distance;
      const y = sin(planet.angle) * planet.distance;
      
      // Update orbit trail
      planet.orbitTrail.push(createVector(x, y));
      if (planet.orbitTrail.length > this.maxTrailPoints) {
        planet.orbitTrail.shift();
      }
    });
  }

  drawPlanets() {
    // Draw orbit trails
    noFill();
    strokeWeight(1);
    this.planets.forEach(planet => {
      beginShape();
      stroke(planet.color, 100);
      planet.orbitTrail.forEach(p => vertex(p.x, p.y));
      endShape();
    });

    // Draw planets
    noStroke();
    this.planets.forEach(planet => {
      const x = cos(planet.angle) * planet.distance;
      const y = sin(planet.angle) * planet.distance;
      
      push();
      translate(x, y);
      
      // Planet atmosphere effect
      for(let i = 3; i > 0; i--) {
        fill(red(planet.color), green(planet.color), blue(planet.color), 50/i);
        circle(0, 0, planet.radius * (1 + i*0.2));
      }
      
      // Main planet body
      fill(planet.color);
      circle(0, 0, planet.radius);
      
      // Add rings for Saturn
      if (planet.name === 'Saturn') {
        push();
        rotateX(PI/3);
        noFill();
        strokeWeight(2);
        for(let i = 1; i <= 3; i++) {
          stroke(planet.color, 150/i);
          ellipse(0, 0, planet.radius * (2 + i*0.3), planet.radius * (2 + i*0.3) * 0.3);
        }
        pop();
      }
      
      pop();
    });
  }

  // Add mouse wheel event for zoom
  mouseWheel(event) {
    this.targetCameraZ += event.delta;
    this.targetCameraZ = constrain(this.targetCameraZ, -1000, 1000);
    return false;
  }
}

// ... rest of existing code ... 