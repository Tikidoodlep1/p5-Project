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

	checkCollision() {
		if(debugMode) {
			push();
			fill(255, 0, 255, 0);
			rect(this.x, this.y, this.x + this.width, this.y + this.height);
			pop();
		}
		
		//If there is a collision between ANY two hitboxes that exist
		for(let i = 0; i < hitboxes.length; i++) {
			//if either hitbox doesn't exist, dont check collision then? -\_'-'_/-
			if(typeof this === null || typeof this === undefined || typeof hitboxes[i] === null || typeof hitboxes[i] === undefined) {
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
	}
}

class hurtbox {
	constructor(x, y, r, attachedHitboxIndex, onCollide) {
		this.x = x;
		this.y = y;
		this.radius = r;
		this.attachedHitboxIndex = attachedHitboxIndex;
		this.onCollide = onCollide;
	}

	setLoc(x, y) {
		this.x = x;
		this.y = y;
	}

	checkCollision() {
		if(debugMode) {
			push();
			fill(255, 0, 255, 0);
			ellipse(this.x, this.y, this.radius);
			pop();
		}

		for(let i = 0; i < hitboxes.length; i++) {
			if(i != this.attachedHitboxIndex) {				
				if(dist(hitboxes[i].x + hitboxes[i].width / 2, hitboxes[i].y + hitboxes[i].height / 2, this.x + this.radius, this.y + this.radius) < (hitboxes[i].width / 2) + this.radius) {
					//this.onCollision(hitboxes[i]);
					this.onCollide(hitboxes[i]);
				}
			}
		}
	}
}

class npc {
	constructor(character, isFriendly) {
		this.character = character;
		this.isFriendly = isFriendly;
		this.idealDist;
	}

	setEnemyParams(idealDist) {
		this.idealDist = idealDist;
		return this;
	}
}

class character {
	//All Characters should use this base
	constructor(name, sprite, spriteLocation, canMelee, canRange, startVector, xSize, ySize, maxSpeed, shouldCameraFollow) {
		this.name = name;
		this.sprite = sprite;
		this.spriteLocation = spriteLocation;
		this.canMelee = canMelee;
		this.canRange = canRange;
		this.doingMelee = false;
		this.doingRanged = false;
		this.attackFrames = 0;
		this.maxSpeed = maxSpeed;
		this.xSize = xSize;
		this.ySize = ySize;
		//Keep one vector for movement, and one for momentum (for slowing down, speeding up, etc.)
		this.pos = startVector;
		this.momentum = new p5.Vector(0, 0);
		this.facing = 0;
		this.hurtbox = null;

		//character hitbox
		this.hitbox = new hitbox(this.pos.x - (xSize/2) + backgroundOffsetX, this.pos.y - (ySize/2) + backgroundOffsetY, xSize, ySize, false, true, this, false, baseCollision);
		//should the camera follow this character
		this.shouldCameraFollow = shouldCameraFollow;
	}

	move(x, y) {
		//set the absolute location of the hitbox, then move the character pos
		this.hitbox.setHitboxLoc(this.pos.x + x, this.pos.y + y);
		this.hitbox.startX = this.pos.x + x;
		this.hitbox.startY = this.pos.y + y;
		this.facing = atan2(this.pos.x, this.pos.y) - atan2(x, y);
		this.pos.add(x, y);
		if(this.shouldCameraFollow) {
			mainCamera.updateCameraMovement(this.pos.x + (this.xSize/2), this.pos.y + (this.ySize/2))
		}
	}

	slowDown() {
		//get the direction the character was heading, then multiply that vector by the momentum. Then move the character and make the momentum -1/8 of it's previous value.
		this.move(this.momentum.x, this.momentum.y);
		this.momentum.add((0-this.momentum.x)/8, (0-this.momentum.y)/8);
	}

	//Momentum is used to make movement look more realistic, so you speed up to a max speed and slow down from a max speed
	addMomentum(x, y) {
		this.momentum.add(x, y);
		this.momentum.limit(this.maxSpeed);
	}

	performAttack() {
		if(this.doingMelee) {
			//rotAngle is based on the frame that we're currently playing. In this case, it's used to determine the "rotation" of the hurtbox in regards to the attacker
			let rotAngle = (this.attackFrames + 5) / 15;
			//if the hurtbox is currently null, make one
			if(this.hurtbox == null) {
				this.hurtbox = new hurtbox(this.pos.x + (this.xSize/2) + backgroundOffsetX + (70 * cos(this.facing + rotAngle)), this.pos.y + (this.ySize/2) + backgroundOffsetY + (70 * sin(this.facing + rotAngle)), this.xSize / 2, this.hitbox.index,
				//IMPORTANT: Here we are passing a function as a parameter. Check hurtbox#checkCollision() for details on calling this 
				function(collisionHitbox) {
					if(collisionHitbox.isCharacterHitbox) {
						console.log("Hit " + collisionHitbox.character.name + "!");
					}
				});
			}
			//Draw the hurtbox
			push();
			fill(255, 0, 0, 255);
			ellipse(this.pos.x + (this.xSize/2) + backgroundOffsetX + (70 * cos(this.facing + rotAngle)), this.pos.y + (this.ySize/2) + backgroundOffsetY + (70 * sin(this.facing + rotAngle)), this.xSize / 2);
			pop();
			this.hurtbox.setLoc(this.pos.x + (this.xSize/2) + backgroundOffsetX + (70 * cos(this.facing + rotAngle)), this.pos.y + (this.ySize/2) + backgroundOffsetY + (70 * sin(this.facing + rotAngle)) );
			this.hurtbox.checkCollision();
			this.attackFrames--;
			if(this.attackFrames <= 0) {
				this.doingMelee = false;
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
				hitboxes[i].setHitboxLoc(hitboxes[i].startX + backgroundOffsetX, hitboxes[i].startY + backgroundOffsetY);
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
const mainCamera = new gameCamera(1536/2, 864/2);

let debugMode = false;

//Keep an array of every existing hitbox for checking collision. If a hitbox gets deleted, it MUST be removed from this.
let hitboxes = [];
//These variables should be used for every object X and Y position to account for camera movement
let backgroundOffsetX = 0;
let backgroundOffsetY = 0;

let baseCollision = function(collisionHitbox, direction) {
		//We want to check if the collided hitbox is used for a character and if both are unpassable. If so, we need to modify character movement
		if(collisionHitbox.isCharacterHitbox && !this.canPass && !collisionHitbox.canPass) {
			//If we're running into the top or bottom, dont cancel the y movement, other wise we're running into the left or right sides and need to cancel the x movement
			if(direction == TOP_SIDE || direction == BOTTOM_SIDE) {
				collisionHitbox.character.pos.add(0, 0-collisionHitbox.character.momentum.y);
			}else {
				collisionHitbox.character.pos.add(0-collisionHitbox.character.momentum.x, 0);
			}
		}
	}

//the player object
let player = new character("Player", -1, -1, true, true, new p5.Vector(150, 150), 50, 50, 4.0, true);
let door = new hitbox(400 + backgroundOffsetX, 400 + backgroundOffsetY, 400, 400, false, false, null, true, baseCollision);
let enemy1 = new npc(new character("enemy1", -1, -1, false, true, new p5.Vector(300, 180), 120, 120, 0.0, false), false).setEnemyParams(80);

let gameDifficulty = "easy";

function setup() {
	let cnv = createCanvas(1536, 864);
	cnv.mousePressed(onMouseClick);
	colorMode(RGB, 255);
	frameRate(60);
	ellipseMode(CENTER);
	rectMode(CORNERS);
}

function draw() {
	background(56, 102, 31);
	//Check if the player should be moving
  	checkShouldMove();
  	//This shows the "door" hitbox for collision testing
 	rect(400 + backgroundOffsetX, 400 + backgroundOffsetY, 800 + backgroundOffsetX, 800 + backgroundOffsetY);
  	//drawing the "player"
 	ellipse(player.pos.x + 25 + backgroundOffsetX, player.pos.y + 25 + backgroundOffsetY, 50, 50);

 	ellipse(enemy1.character.pos.x + backgroundOffsetX, enemy1.character.pos.y + backgroundOffsetY, 120, 120);
 	//For each existing hitbox, check if it's colliding with anything
 	for(let i = 0; i < hitboxes.length; i++) {
 		hitboxes[i].checkCollision();

 		if(hitboxes[i].isCharacterHitbox) {
 			hitboxes[i].character.performAttack();
 		}
 	}

 	if(debugMode) {
 		push();
 		textSize(42);
 		fill(255, 255, 0);
 		text("Debug Mode On", width / 2 - 100, 60);
 		pop();
 	}
}

function keyPressed() {
	//console.log(keyCode);

	if(keyCode == 192) { //192 is the grave (`) button
		debugMode = !debugMode;
	}
}

function onMouseClick() {
	if(player.canMelee && mouseButton === LEFT && !(player.attackFrames > 0)) {
		player.doingMelee = true;
		player.attackFrames = 7;
	}
}

function checkShouldMove() {
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