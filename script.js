let balls = [];
let colors = ['#ED1C24', '#F15A29', '#FFF200', '#00A651', '#2f18fc', '#7F00FF', '#00AEEF', '#EC008C'];
let texts = ['red.html', 'orange.html', 'yellow.html', 'green.html', 'blue.html', 'violet.html', 'cyan.html', 'magenta.html'];

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('sketch-container');
  
  for (let i = 0; i < 8; i++) {
    let x, y, r;
    let isOverlapping;
    
    do {
      x = random(150, width - 150);
      y = random(150, height - 150);
      r = random(70, 150);
      isOverlapping = false;
      
      for (let j = 0; j < balls.length; j++) {
        let d = dist(x, y, balls[j].position.x, balls[j].position.y);
        if (d < r + balls[j].r) {
          isOverlapping = true;
          break;
        }
      }
    } while (isOverlapping);
    
    let ball = new Ball(x, y, r, colors[i]);
    balls.push(ball);
  }
}

function draw() {
  clear();
  for (let i = 0; i < balls.length; i++) {
    let b = balls[i];
    b.update();
    b.display();
    b.checkBoundaryCollision();
    b.checkHover();
  }
  
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      balls[i].checkCollision(balls[j]);
    }
  }
}

function mousePressed() {
  for (let i = 0; i < balls.length; i++) {
    let b = balls[i];
    if (b.isHovered) {
      expandBubble(b, texts[i]);
      break;
    }
  }
}

function expandBubble(ball, link) {
  ball.isExpanding = true;
  for (let i = balls.length - 1; i >= 0; i--) {
    if (balls[i] !== ball) {
      balls.splice(i, 1);
    }
  }
  let expandInterval = setInterval(() => {
    ball.r += 20;
    if (ball.r >= Math.max(width, height)) {
      clearInterval(expandInterval);
      window.location.href = link;
    }
  }, 16);
}

class Ball {
  constructor(x, y, r, color) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D();
    this.velocity.mult(2);
    this.r = r;
    this.m = r * 0.1;
    this.color = color;
    this.isHovered = false;
    this.isExpanding = false;
    this.vibrationOffset = createVector(0, 0);
  }

  update() {
    if (!this.isExpanding) {
      this.position.add(this.velocity);
      
      if (this.isHovered) {
        this.vibrate();
      } else {
        this.vibrationOffset.mult(0);
      }
    }
  }

  checkBoundaryCollision() {
    if (!this.isExpanding) {
      if (this.position.x > width - this.r) {
        this.position.x = width - this.r;
        this.velocity.x *= -1;
      } else if (this.position.x < this.r) {
        this.position.x = this.r;
        this.velocity.x *= -1;
      }

      if (this.position.y > height - this.r) {
        this.position.y = height - this.r;
        this.velocity.y *= -1;
      } else if (this.position.y < this.r) {
        this.position.y = this.r;
        this.velocity.y *= -1;
      }
    }
  }

  checkCollision(other) {
    if (!this.isExpanding && !other.isExpanding) {
      let distanceVect = p5.Vector.sub(other.position, this.position);
      let distanceVectMag = distanceVect.mag();
      let minDistance = this.r + other.r;

      if (distanceVectMag < minDistance) {
        let distanceCorrection = (minDistance - distanceVectMag) / 2.0;
        let correctionVector = distanceVect.copy().normalize().mult(distanceCorrection);
        other.position.add(correctionVector);
        this.position.sub(correctionVector);

        let theta = distanceVect.heading();
        let sine = sin(theta);
        let cosine = cos(theta);

        let bTemp = [createVector(), createVector()];
        bTemp[1].x = cosine * distanceVect.x + sine * distanceVect.y;
        bTemp[1].y = cosine * distanceVect.y - sine * distanceVect.x;

        let vTemp = [createVector(), createVector()];
        vTemp[0].x = cosine * this.velocity.x + sine * this.velocity.y;
        vTemp[0].y = cosine * this.velocity.y - sine * this.velocity.x;
        vTemp[1].x = cosine * other.velocity.x + sine * other.velocity.y;
        vTemp[1].y = cosine * other.velocity.y - sine * other.velocity.x;

        let vFinal = [createVector(), createVector()];
        vFinal[0].x = ((this.m - other.m) * vTemp[0].x + 2 * other.m * vTemp[1].x) / (this.m + other.m);
        vFinal[0].y = vTemp[0].y;
        vFinal[1].x = ((other.m - this.m) * vTemp[1].x + 2 * this.m * vTemp[0].x) / (this.m + other.m);
        vFinal[1].y = vTemp[1].y;

        bTemp[0].add(vFinal[0]);
        bTemp[1].add(vFinal[1]);

        let bFinal = [createVector(), createVector()];
        bFinal[0].x = cosine * bTemp[0].x - sine * bTemp[0].y;
        bFinal[0].y = cosine * bTemp[0].y + sine * bTemp[0].x;
        bFinal[1].x = cosine * bTemp[1].x - sine * bTemp[1].y;
        bFinal[1].y = cosine * bTemp[1].y + sine * bTemp[1].x;

        other.position.x = this.position.x + bFinal[1].x;
        other.position.y = this.position.y + bFinal[1].y;
        this.position.add(bFinal[0]);

        this.velocity.x = cosine * vFinal[0].x - sine * vFinal[0].y;
        this.velocity.y = cosine * vFinal[0].y + sine * vFinal[0].x;
        other.velocity.x = cosine * vFinal[1].x - sine * vFinal[1].y;
        other.velocity.y = cosine * vFinal[1].y + sine * vFinal[1].x;
      }
    }
  }

  checkHover() {
    let d = dist(mouseX, mouseY, this.position.x, this.position.y);
    this.isHovered = d < this.r;
  }

  vibrate() {
    this.vibrationOffset = p5.Vector.random2D();
    this.vibrationOffset.mult(3);
  }

  display() {
    push();
    translate(this.vibrationOffset.x, this.vibrationOffset.y);
    noStroke();
    fill(this.color);
    ellipse(this.position.x, this.position.y, this.r * 2, this.r * 2);
    pop();
  }
}