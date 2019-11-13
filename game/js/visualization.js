var myStorage = window.localStorage;
var rotateRand = 0.00;
var xVelRand = 0.00;
var yVelRand = 0.00;

const WEEKLY_WATER_VOLUME = 14000; // 2 liters a day

function preload() {
    previousState = readPreviousState();
    latestState = pollLatestState();
}

function setup() {
    const diff = compareStates(previousState.data, latestState.data);
    const h = getHeightFromState(latestState.data);
    setFlowerHeight(h);
    console.log(h);


    createCanvas(windowWidth, windowHeight);
    img = loadImage('images/Cat2-4.png');
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

function getHeightFromState(state) {
    var volume = 0;
    for (var i = 0; i < state.length; i++) {
        volume += state[i].volume;
    }
    return getHeightFromVolume(volume);
}

function getHeightFromVolume(volume) {
    return (volume / WEEKLY_WATER_VOLUME) * (7000 - windowHeight);
}

function setFlowerHeight(height) {
    document.getElementById('front').style.bottom = `calc(${-height}})`;
    document.getElementById('mid').style.bottom = `calc(${-height})`;
    document.getElementById('back').style.bottom = `calc(${-height})`;
}

function growFlower(height) {
    $("#front").transition({ y: fy + height + "px" }, "linear")
    $("#mid").transition({ y: (my + height * 6 / 7) + "px" }, "linear")
    $("#back").transition({ y: (by + height * 5 / 7) + "px" }, "linear")
    fy += dec;
    my += dec * 6 / 7;
    by += dec * 5 / 7;
}