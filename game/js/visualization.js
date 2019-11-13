var myStorage = window.localStorage;
var rotateRand = 0.00;
var xVelRand = 0.00;
var yVelRand = 0.00;

flower_height = 0;
my = 0;
by = 0;

var pending_animation_queue = [];
var currentState = {};
var next = 0;

const WEEKLY_WATER_VOLUME = 14000; // 2 liters a day
const CURRENT_STATE = 'current_state';
const SPEED = 500;
const TEXT_SPEED = 800;

function preload() {
    currentState = readPreviousState();
    pollLatestStateAndFindDiff();
}

function setup() {
    flower_height = getHeightFromState(currentState.data);
    setFlowerHeight(flower_height);


    createCanvas(windowWidth, windowHeight);
    img = loadImage('assets/Cat2-4.png');
    imageMode(CENTER);
    blendMode(BLEND);
}

function draw() {
    if (millis() > next) {
        if (pending_animation_queue.length > 0) {
            const drinking_activity = pending_animation_queue.shift();
            growFlower(drinking_activity.volume);
            console.log(drinking_activity);

            currentState.data.push(drinking_activity);
            localStorage.setItem(CURRENT_STATE, JSON.stringify(currentState));
        }

        next = millis() + 1000;
        pollLatestStateAndFindDiff();
    }


    clear();
    const flowerX = updateFlowerX();
    const flowerY = updateFlowerY();
    noFill();
    stroke(2, 98, 0);
    strokeWeight(13);
    bezier(
        windowWidth/2 - 10, windowHeight + flower_height, 
        windowWidth/2 - 10, windowHeight + flower_height/2 , 
        windowWidth/2, windowHeight, 
        flowerX, flowerY
    );
    bezier(
        windowWidth/2, windowHeight + flower_height, 
        windowWidth/2, windowHeight + flower_height/2 , 
        windowWidth/2, windowHeight, 
        flowerX, flowerY
    );
    bezier(
        windowWidth/2 + 10, windowHeight + flower_height, 
        windowWidth/2 + 10, windowHeight + flower_height/2 , 
        windowWidth/2, windowHeight, 
        flowerX, flowerY
    );

    translate(flowerX, flowerY);

    noStroke();
    fill(251, 126, 126, 255);
    rotateRand = rotateRand + 0.005; // Change speed here
    var n = (noise(rotateRand) - 0.5);
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

function readPreviousState() {
    var prev_data = localStorage.getItem(CURRENT_STATE);

    if (prev_data === null || prev_data === "") {
        var empty_data = '{ "data": [] }';
        localStorage.setItem(CURRENT_STATE, empty_data);
        prev_data = localStorage.getItem(CURRENT_STATE);
    }

    return JSON.parse(prev_data);
}

function pollLatestStateAndFindDiff() {
    return loadJSON('../data.json', pushLatestChangeToAnimationQueue);
}

async function pushLatestChangeToAnimationQueue(latestState) {
    const registered_activity_length = currentState.data.length + pending_animation_queue.length;
    if (latestState.data.length < registered_activity_length) {
        throw "Latest state length smaller than previous state. Corrupt data!";
    }

    for (var i = registered_activity_length; i < latestState.data.length; i++) {
        pending_animation_queue.push(latestState.data[i]);
    }
}

function getHeightFromState(state) {
    var volume = 0;
    for (var i = 0; i < currentState.data.length; i++) {
        volume += state[i].volume;
    }
    return getHeightFromVolume(volume);
}

function getHeightFromVolume(volume) {
    return (volume / WEEKLY_WATER_VOLUME) * (7000 - windowHeight);
}

function setFlowerHeight(height) {
    flower_height = height;
    my = height * 6 / 7;
    by = height * 5 / 7;

    document.getElementById('front').style.bottom = `calc(${-flower_height}px)`;
    document.getElementById('mid').style.bottom = `calc(${-my}px)`;
    document.getElementById('back').style.bottom = `calc(${-by}px)`;
}

function growFlower(volume) {

    const height = getHeightFromVolume(volume);

    $("#front").transition({ y: flower_height + height + "px" }, SPEED, "linear")
    $("#mid").transition({ y: (my + height * 6 / 7) + "px" }, SPEED, "linear")
    $("#back").transition({ y: (by + height * 5 / 7) + "px" }, SPEED, "linear")
    flower_height += height;
    my += height * 6 / 7;
    by += height * 5 / 7;

    $("#water-text").html("+"+`${volume}`+"ml")
    $("#water-text").addClass("run-drink")
    setTimeout(() => {
        $("#water-text").removeClass("run-drink")
    }, TEXT_SPEED);
}