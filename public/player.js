let locations = [];
let clientSocket;
let sec = 0;
let min = 0;
let intervalFunction;
let timerText;
let minText, secText;
let role;


function setup() {
	let canvas = createCanvas(600, 600);
	canvas.position(460, 80);
	background(0);
	document.body.style.zoom = "100%"

	clientSocket = io.connect('http://localhost:6677');
	//receive loaction data from any other client connected to the server
	textRegion = createInput();
	textRegion.position(670, 570);
	timerText = select("#timer");
	timerText.size(1000);
	timerText.position(460, 25);
	timerText.html(" ************** WELCOME PLAYER **************** ")
		//	clientSocket.on('guesser', guesserFunction);
		//	clientSocket.on('role', roleFunction);

	clientSocket.on('clearInstruction', screenClear);
	clientSocket.on('wordToDraw', showWhatToDraw);

	clientSocket.on('positionData', replicate);
	clientSocket.on("startTimer", startTimer);
	clientSocket.on("clearTimer", clearTimer);

}

function startTimer(data) {

	intervalFunction = setInterval(timer, 1000);
}

function clearTimer(data) {

	clearInterval(intervalFunction);
	min = 0;
	sec = 0;
	timerText.html("0 0");
	//intervalFunction = setInterval(timer, 1000);

}

function timer() {
	sec++;
	if (sec == 60) {
		min += 1;
		sec = 0;
	}
	strokeWeight(5);
	stroke(255);
	textSize(32);
	if (min <= 9) minText = "0" + min
	else
		minText = min;
	if (sec <= 9)
		secText = "0" + sec;
	else
		secText = sec;

	if (minText == "01" && (secText == "00" || secText == "01")) {
		timerText.html("Times up :)");
		clearInterval(intervalFunction);
	} else {
		timerText.html("****************** TIMER :- " + " " + minText + " : " +
			secText +
			" *****************");
	}
}



function showWhatToDraw(values) {
	strokeWeight(5);
	textAlign(CENTER);
	stroke(255);
	textSize(32);
	text(values[1], 300, 50);
	textSize(50);
	role = values[0];



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
	textRegion.value("");

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

window.addEventListener("beforeunload", function(event) {
	// Most browsers.
	event.preventDefault();

	// Chrome/Chromium based browsers still need this one.
	event.returnValue = "\o/";
});
// window.onbeforeunload = function(e) {
// 	e.preventDefault();
// 	return '';
// 	//	return 'Are you sure you want to leave?';
// };
