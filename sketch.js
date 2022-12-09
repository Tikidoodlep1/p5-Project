let title = ['BEANS'];
let words = ['Unlimited'];

function setup(){

colorMode (RGB, 255, 255, 255, 1);
createCanvas (1080, 800);
background (0, 100, 30, 1);

textSize(24);



}


function draw(){

fill(0, 150, 250);
stroke(255, 200, 0);
strokeWeight(3);
textSize(64);
textFont('Helvetica');
text(title, width/2 - 140, 100);

textSize(58);
textFont('Aharoni');
text(words, width/2 - 150, 200);

textSize(38);
textFont('Helvetica');
text('Click to Start', width/2 - 140, height/2);

text('Controls: W A S D to move', width/2 - 540, 600)
text('Attack: Left Click', width/2 - 540, 700);
text('Objective: Survive as many waves of attackers as you can', width/2, 575, 400, 400);

}


class hitbox {
  //Hitboxes
  constructor(x, y, xSize, ySize, canPass, isCharacterHitbox, character, isStaticHitbox, onCollide) {
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.width = xSize;
    this.height = ySize;
    this.canPass = canPass;
    //This hitboxes index in the global hitbox array for removal and checking that it isn't colliding with itself
    this.index = hitboxes.length;
    //Is this used for a character
    this.isCharacterHitbox = isCharacterHitbox;
    this.character = character;
    //Does this hitbox move
    this.isStaticHitbox = isStaticHitbox;
    //Any function passed to this variable NEEDS to use the same two parameters (Name doesn't matter)
    this.onCollide = onCollide;
    hitboxes[this.index] = this;
  }

  setHitboxLoc(x, y) {
    this.x = x;
    this.y = y;
  }

  drawStaticHitbox() {
    push();
    noStroke();
    fill(160, 160, 160, 255);
    rect(this.x, this.y, this.x + this.width, this.y + this.height);
    pop();
  }

  checkCollision() {
    if(debugMode) {
      push();
      fill(0, 0, 0, 0);
      rect(this.x, this.y, this.x + this.width, this.y + this.height);
      pop();
    }
    
    //If there is a collision between ANY two hitboxes that exist
    for(let i = 0; i < hitboxes.length; i++) {
      //if either hitbox doesn't exist, dont check collision then -\_'-'_/-
      if(this == null || hitboxes[i] == null) {
        continue;
      }

      //Don't check hitboxes that don't move, they will never be a collider, just a collidee
      if(hitboxes[i].isStaticHitbox) {
        //Continue means to skip the rest of the code and go to the next cycle of the loop
        continue;
      }

      /*
      * Here we are checking the following in this order:
      * if the hitbox colliding here is not itself
      * if there is a collision on the top side of the hitbox
      * if there is a collision on the left side of the hitbox
      * if there is a collision on the right side of the hitbox
      * if there is a collision on the bottom side of the hitbox
      */
      if(i != this.index) {
        if(hitboxes[i].x+hitboxes[i].width > this.x && hitboxes[i].x < this.x+this.width && hitboxes[i].y+hitboxes[i].height > this.y && hitboxes[i].y < this.y)  {
          //this.onCollision(hitboxes[i], TOP_SIDE);
          this.onCollide(hitboxes[i], TOP_SIDE);
        }else if(hitboxes[i].x+hitboxes[i].width > this.x && hitboxes[i].x < this.x+this.width && hitboxes[i].y+hitboxes[i].height > this.y+this.height-1 && hitboxes[i].y < this.y+this.height) {
          //this.onCollision(hitboxes[i], BOTTOM_SIDE);
          this.onCollide(hitboxes[i], BOTTOM_SIDE);
        }
        if(hitboxes[i].x+hitboxes[i].width > this.x && hitboxes[i].x < this.x+1 && hitboxes[i].y+hitboxes[i].height > this.y && hitboxes[i].y < this.y+this.height) {
          //this.onCollision(hitboxes[i], LEFT_SIDE);
          this.onCollide(hitboxes[i], LEFT_SIDE);
        }else if(hitboxes[i].x+hitboxes[i].width-1 > this.x+this.width && hitboxes[i].x < this.x+this.width && hitboxes[i].y+hitboxes[i].height > this.y && hitboxes[i].y < this.y+this.height) {
          //this.onCollision(hitboxes[i], RIGHT_SIDE);
          this.onCollide(hitboxes[i], RIGHT_SIDE);
        }
      }
    }
  }

  //Remove this hitbox from the hitboxes array
  delete() {
    hitboxes[this.index] = null;
    delete this;
  }
}

class hurtbox {
  constructor(x, y, d, attachedHitboxIndex, onCollide) {
    this.x = x;
    this.y = y;
    this.diameter = d;
    this.attachedHitboxIndex = attachedHitboxIndex;
    this.onCollide = onCollide;
    this.index = hurtboxes.length;
    hurtboxes[this.index] = this;
  }

  setLoc(x, y) {
    this.x = x;
    this.y = y;
  }

  checkCollision() {
    if(debugMode) {
      push();
      fill(0, 0, 0, 0);
      ellipse(this.x, this.y, this.diameter + 10);
      pop();
    }

    for(let i = 0; i < hitboxes.length; i++) {
      if(hitboxes[i] == null || hitboxes[i] == undefined) {
        continue;
      }

      if(i != this.attachedHitboxIndex) {
        if(dist(this.x + (this.diameter / 2), this.y + (this.diameter / 2), hitboxes[i].x + (hitboxes[i].width / 2), hitboxes[i].y + (hitboxes[i].height / 2)) <= (hitboxes[i].width + this.diameter / 2) ) {
          this.onCollide(hitboxes[i]);
        }
      }
    }
  }

  //Remove this hurtbox from the hitboxes array
  delete() {
    hurtboxes[this.index] = null;
    delete this;
  }
}

// class projectile {
//  constructor(startX, startY, diameter, angle, speed, onHit) {
//    this.x = startX;
//    this.y = startY;
//    this.diameter = diameter;
//    this.momentum = p5.Vector.fromAngle(angle);
//    this.speed = speed;
//    this.onHit = onHit;
//    this.hurtbox = new hurtbox(startX, startY, diameter, -1, onHit);
//  }

//  move() {
//    this.x += this.momentum.x;
//    this.y += this.momentum.y;
//    this.hurtbox.setLoc(this.x, this.y);
//  }
// }

class npc {
  constructor(character, isFriendly) {
    this.character = character;
    this.isFriendly = isFriendly;
    this.idealDist;
    this.npcIndex = npcs.length;
    npcs[npcs.length] = this;
  }

  setEnemyParams(idealDist) {
    this.idealDist = idealDist;
    this.angle;
    this.attackStart = 0;
    this.runFrames = 0;
    return this;
  }

  drawEnemyAsCircle() {
    push();
    fill(165, 25, 55, 255);
    ellipse(this.character.pos.x + (this.character.xSize / 2) + backgroundOffsetX, this.character.pos.y + (this.character.ySize / 2) + backgroundOffsetY, this.character.xSize, this.character.ySize);
    stroke(255, 0, 0);
    strokeWeight(3);
    line(this.character.pos.x + backgroundOffsetX, this.character.pos.y + backgroundOffsetY - 5, this.character.pos.x + (map(this.character.health, 0, this.character.maxHealth, 0, this.character.xSize)) + backgroundOffsetX, this.character.pos.y + backgroundOffsetY - 5);
    pop();
  }

  //Remove this npc from the npcs array
  delete() {
    npcs[this.npcIndex] = null;
    delete this;
  }

  update() {
    if(this == null) {
      return;
    }

    if(!this.isFriendly) {
      let angleToPlayer = atan2( (this.character.pos.y - player.pos.y), (this.character.pos.x - player.pos.x) );
      this.angle = p5.Vector.fromAngle(angleToPlayer);
      this.angle.normalize();
      this.character.addMomentum(this.angle.x / 10, this.angle.y / 10);
      let playerDist = dist(this.character.pos.x + (this.character.xSize / 2), this.character.pos.y + (this.character.ySize / 2), player.pos.x + (player.xSize / 2), player.pos.y + (player.ySize / 2));

      if(playerDist > 2000) {
        console.log(this.character.name + " was defeated!");
        this.character.defeated();
        this.delete();
        return;
      }

      if(playerDist <= this.idealDist) {
        if(player.facing > angleToPlayer - (PI / 4) && player.facing < angleToPlayer + (PI / 4)) {
          this.runFrames = 32;
        }else {
          if(this.character.attackFrames <= 0 && this.attackStart <= millis() - 700) {
            this.attackStart = millis();
            this.character.doingMelee = true;
            this.character.attackFrames = 9;
          }
        }

        if(this.runFrames > 0) {
          this.character.addMomentum(-this.angle.x / 10, -this.angle.y / 10);
          this.character.move(this.character.momentum.x, this.character.momentum.y);
          this.runFrames--;
        }

      }else {
        if(this.runFrames > 0) {
          this.character.addMomentum(-this.angle.x / 10, -this.angle.y / 10);
          this.character.move(this.character.momentum.x, this.character.momentum.y);
          this.runFrames--;
        }else {
          this.character.move(-this.character.momentum.x, -this.character.momentum.y);
        }
      }


    }
  }
}

class character {
  //All Characters should use this base
  constructor(name, sprite, spriteLocation, canMelee, damage, startVector, xSize, ySize, maxSpeed, maxHealth, shouldCameraFollow, collisionMethod) {
    this.name = name;
    this.sprite = sprite;
    this.spriteLocation = spriteLocation;
    this.canMelee = canMelee;
    this.doingMelee = false;
    this.meleeDamage = damage;
    this.attackFrames = 0;
    this.maxSpeed = maxSpeed;
    this.xSize = xSize;
    this.ySize = ySize;
    //Keep one vector for movement, and one for momentum (for slowing down, speeding up, etc.)
    this.pos = startVector;
    this.momentum = new p5.Vector(0, 0);
    this.facing = 0;
    this.hurtbox = null;
    this.health = maxHealth;
    this.maxHealth = maxHealth;

    //character hitbox
    this.hitbox = new hitbox(this.pos.x - (xSize/2) + backgroundOffsetX, this.pos.y - (ySize/2) + backgroundOffsetY, xSize, ySize, false, true, this, false, collisionMethod);
    //should the camera follow this character
    this.shouldCameraFollow = shouldCameraFollow;
  }

  move(x, y) {
    //set the absolute location of the hitbox, then move the character pos
    this.hitbox.setHitboxLoc(this.pos.x + x, this.pos.y + y);
    this.facing = atan2(this.pos.x, this.pos.y) - atan2(x, y);
    this.pos.add(x, y);
    if(this.shouldCameraFollow) {
      mainCamera.updateCameraMovement(this.pos.x + (this.xSize/2), this.pos.y + (this.ySize/2))
    }
  }

  slowDown() {
    //get the direction the character was heading, then multiply that vector by the momentum. Then move the character and make the momentum -1/8 of it's previous value.
    this.momentum.add((0-this.momentum.x)/8, (0-this.momentum.y)/8);
    this.move(this.momentum.x, this.momentum.y);
  }

  //Momentum is used to make movement look more realistic, so you speed up to a max speed and slow down from a max speed
  addMomentum(x, y) {
    this.momentum.add(x, y);
    this.momentum.limit(this.maxSpeed);
  }

  damage(amount) {
    this.health -= amount;
  }

  heal(amount) {
    if(this.health + amount <= this.maxHealth) {
      this.health += amount;
    }else {
      this.health = this.maxHealth;
    }
  }

  defeated() {
    this.hitbox.delete();
    if(this.hurtbox != null) {
      this.hurtbox.delete();
    }
    delete this;
  }

  performAttack() {
    if(this.doingMelee) {
      //rotAngle is based on the frame that we're currently playing. In this case, it's used to determine the "rotation" of the hurtbox in regards to the attacker
      let rotAngle = (this.attackFrames + 9) / 15;
      //if the hurtbox is currently null, make one
      if(this.hurtbox == null) {
        this.hurtbox = new hurtbox(this.pos.x + (this.xSize/2) + backgroundOffsetX + (70 * cos(this.facing + rotAngle)), this.pos.y + (this.ySize/2) + backgroundOffsetY + (70 * sin(this.facing + rotAngle)), this.xSize / 2, this.hitbox.index,
        //IMPORTANT: Here we are passing a function as a parameter. Check hurtbox#checkCollision() for details on calling this 
        function(collisionHitbox) {
          if(collisionHitbox.isCharacterHitbox) {
            collisionHitbox.character.damage(hitboxes[this.attachedHitboxIndex].character.meleeDamage);
            if(collisionHitbox.character.health <= 0) {
              collisionHitbox.character.defeated();
              collisionHitbox.character.pos.x = -24000;
              collisionHitbox.character.pos.y = -24000;

              if(collisionHitbox.character === player) {
                gameLost = true;
              }

              return;
            }
          }
        });
      }
      //Draw the hurtbox
      push();
      fill(255, 0, 0, 255);
      ellipse(this.pos.x + (this.xSize/2) + backgroundOffsetX + (70 * cos(this.facing + rotAngle)), this.pos.y + (this.ySize/2) + backgroundOffsetY + (70 * sin(this.facing + rotAngle)), this.xSize / 2);
      pop();
      this.hurtbox.setLoc(this.pos.x + (this.xSize/2) + backgroundOffsetX + (70 * cos(this.facing + rotAngle)), this.pos.y + (this.ySize/2) + backgroundOffsetY + (70 * sin(this.facing + rotAngle)) );
      //this.hurtbox.checkCollision();
      this.attackFrames--;
      if(this.attackFrames <= 0) {
        this.doingMelee = false;
        this.hurtbox.delete();
        this.hurtbox = null;
      }
      
    }
  }
}

class gameCamera {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  updateCameraMovement(x, y) {
    if(this.x != x || this.y != y) {
      backgroundOffsetX += this.x - x;
      backgroundOffsetY += this.y - y;
      this.x = x;
      this.y = y;
      for(let i = 0; i < hitboxes.length; i++) {
        if(hitboxes[i] == null) {
          continue;
        }

        hitboxes[i].setHitboxLoc(hitboxes[i].x + backgroundOffsetX, hitboxes[i].y + backgroundOffsetY);

        if(hitboxes[i].isCharacterHitbox) {
          hitboxes[i].character.pos.set(hitboxes[i].character.pos.x + backgroundOffsetX, hitboxes[i].character.pos.y + backgroundOffsetY);
        }
      }
    }
  }
}

//Direction constants
const TOP_SIDE = 0;
const LEFT_SIDE = 1;
const RIGHT_SIDE = 2;
const BOTTOM_SIDE = 3;

//Key code constants
const wKey = 87;
const aKey = 65;
const sKey = 83;
const dKey = 68;
const spaceKey = 32;

//use canvas size / 2 for x and y
const mainCamera = new gameCamera(1500/2, 990/2);

let debugMode = false;

//Keep an array of every existing hitbox for checking collision. If a hitbox gets deleted, it MUST be removed from this.
let hitboxes = [];
let hurtboxes = [];
let npcs = [];

//These variables should be used for every object X and Y position to account for camera movement
let backgroundOffsetX = 0;
let backgroundOffsetY = 0;

let baseCollision = function(collisionHitbox, direction) {
    //We want to check if the collided hitbox is used for a character and if both are unpassable. If so, we need to modify character movement
    if(collisionHitbox.isCharacterHitbox && !this.canPass && !collisionHitbox.canPass) {
      //If we're running into the top or bottom, cancel the y movement, otherwise we're running into the left or right sides and need to cancel the x movement
      if(direction == TOP_SIDE || direction == BOTTOM_SIDE) {
        collisionHitbox.character.pos.add(0, (0-collisionHitbox.character.momentum.y) );
        collisionHitbox.character.momentum.set(collisionHitbox.character.momentum.x, 0);
      }else {
        collisionHitbox.character.pos.add((0-collisionHitbox.character.momentum.x) , 0);
        collisionHitbox.character.momentum.set(0, collisionHitbox.character.momentum.y);
      }
    }
  }

let npcCollision = function(collisionHitbox, direction) {
  //We want to check if the collided hitbox is used for a character and if both are unpassable. If so, we need to modify character movement
    if(collisionHitbox.isCharacterHitbox && !this.canPass && !collisionHitbox.canPass) {
      //If we're running into the top or bottom, cancel the y movement, otherwise we're running into the left or right sides and need to cancel the x movement
      if(direction == TOP_SIDE || direction == BOTTOM_SIDE) {
        collisionHitbox.character.pos.add(0, (0-collisionHitbox.character.momentum.y));
        collisionHitbox.character.momentum.set(collisionHitbox.character.momentum.x, 0-(collisionHitbox.character.momentum.y / 2));
      }else {
        collisionHitbox.character.pos.add((0-collisionHitbox.character.momentum.x), 0);
        collisionHitbox.character.momentum.set(0-(collisionHitbox.character.momentum.x / 2), collisionHitbox.character.momentum.y);
      }
    }
  }

//the player object
let player = new character("Player", -1, -1, true, 7, new p5.Vector(520, 250), 50, 50, 4.0, 430, true, baseCollision);
let wall1 = new hitbox(-200, -200, 100, 1000, false, false, null, true, baseCollision);
let wall2 = new hitbox(1200, -200, 100, 1000, false, false, null, true, baseCollision);
let wall3 = new hitbox(-200, -300, 1500, 100, false, false, null, true, baseCollision);
let wall4 = new hitbox(-200, 800, 1500, 100, false, false, null, true, baseCollision);

//currently unused
let gameDifficulty = "easy";

let backgroundMusic;
let shouldSpawnEnemies = true;
let waveNum = 1;
let enemiesPerWave = 2;
let gameLost = false;
let mills = 0;
let showTitle = true;
function preload() {
  // soundFormats('mp3');
  backgroundMusic = loadSound('Halo.mp3');


}
function setup() {
  let cnv = createCanvas(1500, 990);
  cnv.mousePressed(onMouseClick);
  colorMode(RGB, 255);
  frameRate(60);
  ellipseMode(CENTER);
  rectMode(CORNERS);
}
function draw() {
  background(36, 82, 36);
  if(showTitle){
    showTitleScreen();
  }else {
  //Check if the player should be moving
    checkShouldMove();

  //Arena Bounds
  wall1.drawStaticHitbox();
  wall2.drawStaticHitbox();
  wall3.drawStaticHitbox();
  wall4.drawStaticHitbox();

    //drawing the "player"
  ellipse(player.pos.x + 25 + backgroundOffsetX, player.pos.y + 25 + backgroundOffsetY, 50, 50);

  if(shouldSpawnEnemies) {
    let seconds = 5;
    
    if(seconds + mills - (millis() / 1000) > 0) {
      preWaveTimer((seconds + mills - (millis() / 1000)).toPrecision(2));
      player.heal(0.5);
    }else if(seconds - (millis() / 1000) <= 0) {
      let rand = random(-1, 3);
      let anchorX = 520 + backgroundOffsetX;
      let anchorY = 250 + backgroundOffsetY;
      push();
      fill(255);
      ellipse(anchorX, anchorY, 10, 10);
      pop();
      for(let i = 0; i < enemiesPerWave + rand; i++) {
        new npc(new character("enemy" + i, -1, -1, true, (waveNum*1.5) + 2, new p5.Vector(anchorX + random(-100, 100), anchorY + random(-100, 100)), 30, 30, 2.5, (waveNum*1.5) + 80 + random(-25, 26), false, npcCollision), false).setEnemyParams(90);
      }
      waveNum++;
      shouldSpawnEnemies = false;
    }
  }

  if(gameLost) {
    push();
    textSize(48);
    fill(155, 20, 225);
    text("Game Over! You beat " + (waveNum - 2) + " waves of enemies! Refresh to play again!", (width / 2) - 400, height / 2, 900, 400);
    pop();
  }else {
    push();
    textSize(28);
    fill(20, 12, 12);
    text("Health:", 40, 40);
    rect(130, 16, 330, 46);
    fill(255, 25, 35);
    text("Health:", 38, 38);
    rect(130, 16, 130 + map(player.health, 0, player.maxHealth, 0, 200), 46);
    pop();
  }
  

  //For each existing hitbox, check if it's colliding with anything
  for(let i = 0; i < hitboxes.length; i++) {
    if(hitboxes[i] == null) {
      continue;
    }

    hitboxes[i].checkCollision();

    if(hitboxes[i].isCharacterHitbox) {
      hitboxes[i].character.performAttack();
    }
    
  }

  for(let i = 0; i < hurtboxes.length; i++) {
    if(hurtboxes[i] == null) {
      continue;
    }
    hurtboxes[i].checkCollision();
  }

  if(!gameLost && !shouldSpawnEnemies) {
    let numNulls = 0;
    for(let i = 0; i < npcs.length; i++) {
      if(npcs[i] == null || npcs[i] == undefined) {
        numNulls++;
        if(numNulls == npcs.length - 1) {
          shouldSpawnEnemies = true;
          mills = millis() / 1000;
        }
      }else {
        break;
      }
    }
  }

  for(let i = 0; i < npcs.length; i++) {
    if(npcs[i] == null) {
      continue;
    }

    if(!npcs[i].isFriendly) {
      if(npcs[i].character.hitbox == null) {
        npcs[i].delete();
      }

      for(let j = 0; j < npcs.length; j++) {
        if(npcs[j] == null || i == j) {
          continue;
        }

        if(npcs[i].character.pos.dist(npcs[j].character.pos) <= 45) {
          npcs[j].runFrames = 20;
        }
      }

      npcs[i].drawEnemyAsCircle();
      npcs[i].update();
    }
  }
  numNulls = 0;

  if(debugMode) {
    push();
    textSize(42);
    fill(255, 255, 0);
    text("Debug Mode On", width / 2 - 100, 60);

    strokeWeight(5);
    point(player.pos.x, player.pos.y);
    pop();
  }
  }
}

function keyPressed() {
  //console.log(keyCode);

  if(keyCode == 192) { //192 is the grave (`) button
    debugMode = !debugMode;
  }
}

function onMouseClick() {
if(showTitle) {
  showTitle = !showTitle;
  backgroundMusic.play();
  backgroundMusic.loop();
}

  if(player.canMelee && mouseButton === LEFT && !(player.attackFrames > 0)) {
    player.doingMelee = true;
    player.attackFrames = 7;
  }

  //Write canRangedAttack code here :)
}

function preWaveTimer(time) {
  push();
  fill(155, 20, 225);
  textSize(26);
  text("Enemies Spawn in " + time, 530, 180);
  pop();
}
function showTitleScreen() {
push();
  fill(0, 150, 250);
stroke(255, 200, 0);
strokeWeight(3);
textSize(64);
textFont('Helvetica');
text(title, width/2 - 140, 100);

textSize(58);
textFont('Aharoni');
text(words, width/2 - 150, 200);

textSize(38);
textFont('Helvetica');
text('Click to Start', width/2 - 140, height/2);

text('Controls: W A S D to move', width/2 - 540, 600)
text('Attack: Left Click', width/2 - 540, 700);
text('Objective: Survive as many waves of attackers as you can', width/2, 575, 400, 400);
pop();
}

function checkShouldMove() {
  if(!gameLost) {
    //if the player has either W, S, A, or D held down, we want to move the player character
    if(keyIsDown(wKey)) {
      player.addMomentum(0, -0.1);
    }
    if(keyIsDown(sKey)) {
      player.addMomentum(0, 0.1);
    }
    if(keyIsDown(aKey)) {
      player.addMomentum(-0.1, 0);
    }
    if(keyIsDown(dKey)) {
      player.addMomentum(0.1, 0);
    }

    //We call move from here instead of above because if called above and the player is holding 2 keys down it will call move twice, speeding them up and ignoring hitboxes.
    if(keyIsDown(wKey) || keyIsDown(sKey) || keyIsDown(aKey) || keyIsDown(dKey)) {
      player.move(player.momentum.x, player.momentum.y);
    }

    //If momentum isn't 0 and the player isn't holding W, S, A, or D, we want to slow the player down
    if( (player.momentum.x > 0.1 || player.momentum.x < -0.1 || player.momentum.y > 0.1 || player.momentum.y < -0.1) && !keyIsDown(wKey) && !keyIsDown(sKey) && !keyIsDown(aKey) && !keyIsDown(dKey)) {
      player.slowDown();
    }
  }
}
