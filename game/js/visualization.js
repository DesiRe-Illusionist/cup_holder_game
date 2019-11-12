var myStorage = window.localStorage;
var rotateRand = 0.00;
var xVelRand = 0.00;
var yVelRand = 0.00;

function preload() {
    previousState = readPreviousState();
    latestState = pollLatestState();
}

function setup() {
    const diff = compareStates(previousState.data, latestState.data);
    console.log(diff);


    createCanvas(windowWidth, windowHeight);
    yCenter = height/3;

    img = loadImage('images/Cat2-4.png');
    // background(0);
    imageMode(CENTER);
    blendMode(BLEND);
}

function draw() {
    clear();

    rotateRand = rotateRand + 0.005; // Change speed here
    var n = (noise(rotateRand) - 0.5);
    
    noStroke();
    
    translate(updateFlowerX(), updateFlowerY());
    fill(251, 126, 126, 255);
    rotate(n);
    for (var i = 0; i < 10; i ++) {
        rotate(PI/5);
        ellipse(0, 100, 60, 160);
    }

    rotate(-PI/5 * 10 - n);
    image(img, 0, 0);
}

function updateFlowerX() {
    var xVel = 80 * sin(xVelRand);
    xVelRand += 0.035;
    var xCenter = width/2 + xVel;
    return xCenter;
}

function updateFlowerY() {
    var yVel = -20 * cos(yVelRand);
    yVelRand += 0.07;
    var yCenter = height/2 + yVel;
    return yCenter;
}

function pollLatestState() {
    return loadJSON('../data.json');
}

function readPreviousState() {
    var prev_data = localStorage.getItem('prev_data');

    if (prev_data === null || prev_data === "") {
        var empty_data = '{ "data": [] }';
        localStorage.setItem("prev_data", empty_data);
        prev_data = localStorage.getItem('prev_data');
    }

    return JSON.parse(prev_data);
}

function compareStates(previousState, latestState) {
    if (latestState.length < previousState.length) {
        throw "Latest state length smaller than previous state. Corrupt data!";
    }
    const diff = [];
    for (var i = previousState.length; i < latestState.length; i++) {
        diff.push(latestState[i]);
    }

    return diff;
}