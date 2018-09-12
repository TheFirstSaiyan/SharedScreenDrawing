let locations = [];
let clientSocket;


function setup() {
	createCanvas(400, 400);
	background(0);
	clientSocket = io.connect('http://localhost:6677');
	//receive loaction data from any other client connected to the server
	textRegion = createInput();
	textRegion.position(125, 425);
	//	clientSocket.on('guesser', guesserFunction);
	alertBox = createInput();
	//	clientSocket.on('role', roleFunction);

	clientSocket.on('clearInstruction', screenClear);

	clientSocket.on('positionData', replicate);
	clientSocket.on('drawer', drawer);
	clientSocket.on('guesser', guesser);
	clientSocket.on('wordToDraw', showWhatToDraw)
		//clientSocket.on('wordToDraw', drawWord);
		//clientSocket.on('wordToDraw', well);
		//clientSocket.on("showText", showText);

}

function showText(data) {
	strokeWeight(5);
	stroke(255);
	textSize(32);
	text(data, 150, 50);

}

function showWhatToDraw(values) {
	strokeWeight(5);
	textAlign(CENTER);
	stroke(255);
	textSize(32);
	text(values[1], 180, 50);


}

function drawer(data) {

	alertBox.value(data);

}

function guesser(data) {
	alertBox.value(data);
}



function drawWord(data) {
	console.log("draw" + data);
	background(0);
}

function replicate(data) {
	strokeWeight(10);
	stroke(50, 0, 100);
	line(data.px, data.py, data.x, data.y);
}

function screenClear(data) {
	background(0);
	console.log("cleared screen" + data);
	//clientSocket.emit('WhatIsMyRole', "not sure");

}

function mouseReleased() {
	locations = [];
}


function mouseDragged() {
	strokeWeight(10);
	stroke(255);
	if (mouseIsPressed) {
		line(pmouseX, pmouseY, mouseX, mouseY);
	}
	let data = {
		px: pmouseX,
		py: pmouseY,
		x: mouseX,
		y: mouseY
	};
	// send current values of location to the server
	clientSocket.emit('positionData', data);
}

function keyPressed() {
	if (keyCode == ENTER) {
		console.log(textRegion.value());
		clientSocket.emit('guess', textRegion.value());

	}
}

function draw() {

}
