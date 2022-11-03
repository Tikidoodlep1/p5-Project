class hitbox {
	//Hitboxes
	constructor(x, y, width, height, canPass, isCharacterHitbox, character, isStaticHitbox) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.canPass = canPass;
		//This hitboxes index in the global hitbox array for removal and checking that it isn't colliding with itself
		this.index = hitboxes.length;
		//Is this used for a character
		this.isCharacterHitbox = isCharacterHitbox;
		this.character = character;
		//Does this hitbox move
		this.isStaticHitbox = isStaticHitbox;
		hitboxes[this.index] = this;
	}

	setHitboxLoc(x, y) {
		this.x = x;
		this.y = y;
	}

	checkCollision() {
		//If there is a collision between ANY two hitboxes that exist
		for(let i = 0; i < hitboxes.length; i++) {
			//Don't check hitboxes that don't move, they will never be a collider, just a collidee
			if(hitboxes[i].isStaticHitbox) {
				return;
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
				if(hitboxes[i].x+hitboxes[i].width > this.x && hitboxes[i].x < this.x+this.width && hitboxes[i].y+hitboxes[i].height > this.y && hitboxes[i].y < this.y+1)  {
					this.onCollision(hitboxes[i], TOP_SIDE);
				}else if(hitboxes[i].x+hitboxes[i].width > this.x && hitboxes[i].x < this.x+1 && hitboxes[i].y+hitboxes[i].height > this.y && hitboxes[i].y < this.y+this.height) {
					this.onCollision(hitboxes[i], LEFT_SIDE);
				}else if(hitboxes[i].x+hitboxes[i].width-1 > this.x+this.width && hitboxes[i].x < this.x+this.width && hitboxes[i].y+hitboxes[i].height > this.y && hitboxes[i].y < this.y+this.height) {
					this.onCollision(hitboxes[i], RIGHT_SIDE);
				}else if(hitboxes[i].x+hitboxes[i].width > this.x && hitboxes[i].x < this.x+this.width && hitboxes[i].y+hitboxes[i].height > this.y+this.height-1 && hitboxes[i].y < this.y+this.height) {
					this.onCollision(hitboxes[i], BOTTOM_SIDE);
				}
			}
		}
	}
	
	onCollision(collisionHitbox, direction) {
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
}

class character {
	//All Characters should use this base
	constructor(name, sprite, spriteLocation, canMelee, canRange, startVector, xSize, ySize, maxSpeed) {
		this.name = name;
		this.sprite = sprite;
		this.spriteLocation = spriteLocation;
		this.canMelee = canMelee;
		this.canRange = canRange;
		this.maxSpeed = maxSpeed;
		//Keep one vector for movement, and one for momentum (for slowing down, speeding up, etc.)
		this.pos = startVector;
		this.momentum = new p5.Vector(0, 0);
		//character hitbox
		this.hitbox = new hitbox(this.pos.x - (xSize/2), this.pos.y - (ySize/2), xSize, ySize, false, true, this, false);
	}

	move(x, y) {
		//set the absolute location of the hitbox, then move the character pos
		this.hitbox.setHitboxLoc(this.pos.x + x, this.pos.y + y);
		this.pos.add(x, y);
	}

	slowDown() {
		//get the direction the character was heading, then multiply that vector by the momentum. Then move the character and make the momentum -1/8 of it's previous value.
		let vector = p5.Vector.fromAngle(this.pos.heading()).mult(this.momentum, this.momentum);
		this.move(vector.x, vector.y);
		this.momentum.add((0-this.momentum.x)/8, (0-this.momentum.y)/8);
	}

	addMomentum(x, y) {
		this.momentum.add(x, y);
		this.momentum.limit(this.maxSpeed);
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
//Keep an array of every existing hitbox for checking collision. If a hitbox gets deleted, it MUST be removed from this.
let hitboxes = [];
//the player object
let player = new character("Player", -1, -1, true, true, new p5.Vector(150, 150), 50, 50, 4.0);
let door = new hitbox(400, 400, 400, 400, false, false, null, true);

function setup() {
  createCanvas(1920, 1080);
  colorMode(RGB, 255);
  frameRate(60);
  ellipseMode(CENTER);
  rectMode(CORNERS);
  console.log(hitboxes);
}

function draw() {
	background(56, 102, 31);
	//Check if the player should be moving
  	checkShouldMove();
  	//This shows the "door" hitbox for collision testing
 	rect(400, 400, 800, 800);
  	//drawing the "player"
 	ellipse(player.pos.x + 25, player.pos.y + 25, 50, 50);
 	//For each existing hitbox, check if it's colliding with anything
 	for(let i = 0; i < hitboxes.length; i++) {
 		hitboxes[i].checkCollision();
 	}
 	
}

function keyPressed() {
	//console.log(keyCode);
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