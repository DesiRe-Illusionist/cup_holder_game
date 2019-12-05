var myStorage = window.localStorage;
var rotateRand = 0.00;
var xVelRand = 0.00;
var yVelRand = 0.00;
var lastDrinkTime = new Date();
var isGrowing = false;

flower_height = 0;
my = 0;
by = 0;

var pending_animation_queue = [];
var currentState = {};
var next = 0;

const WEEKLY_WATER_VOLUME = 14000; // 2 liters a day
const CURRENT_STATE = 'current_state';
const SPEED = 500;
const TEXT_SPEED = 1200;
const UPDATE_SPEED = 100;

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

// lastDrinkTime.setDate(lastDrinkTime.getDate() - 0);
//lastDrinkTime.setHours(lastDrinkTime.getHours() - 2);
//lastDrinkTime.setMinutes(lastDrinkTime.getMinutes() - 8);
//lastDrinkTime.setSeconds(lastDrinkTime.getSeconds() - 12);


function draw() {
    clear();

    if (millis() > next) {
        if (pending_animation_queue.length > 0 && isGrowing === false) {
            lastDrinkTime = new Date(0);
            lastDrinkTime.setUTCSeconds(pending_animation_queue[pending_animation_queue.length - 1].time);
            const drinking_activity = pending_animation_queue.shift();
            growFlower(drinking_activity.volume);

            currentState.data.push(drinking_activity);
            //FIREBASE
            localStorage.setItem(CURRENT_STATE, JSON.stringify(currentState));
        }

        next = millis() + UPDATE_SPEED;
        pollLatestStateAndFindDiff();
    }

    const flowerX = updateFlowerX();
    const flowerY = updateFlowerY();

    renderFlowerVine(flowerX, flowerY);
    renderFlower(flowerX, flowerY);
    renderReminder()
}

function updateFlowerX() {
    var xVel = 80 * sin(xVelRand);
    xVelRand += 0.035;
    var xCenter = width / 2 + xVel;
    return xCenter;
}

function updateFlowerY() {
    var yVel = -20 * cos(yVelRand);
    yVelRand += 0.07;
    var yCenter = height / 2 + yVel;
    return yCenter;
}

function readPreviousState() {
    var prev_data = localStorage.getItem(CURRENT_STATE);

    //FIREBASE

    if (prev_data === null || prev_data === "") {
        var empty_data = '{ "data": [] }';
        localStorage.setItem(CURRENT_STATE, empty_data);
        prev_data = localStorage.getItem(CURRENT_STATE);
    }

    return JSON.parse(prev_data);
}

function pollLatestStateAndFindDiff() {

    //FIREBASE
    return loadJSON('../data.json', pushLatestChangeToAnimationQueue);
}

async function pushLatestChangeToAnimationQueue(latestState) {

    //FIREBASE
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
    // 125 * ln(x + 1)
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

    isGrowing = true;
    const height = getHeightFromVolume(volume);

    $("#front").transition({ y: flower_height + height + "px" }, SPEED, "linear")
    $("#mid").transition({ y: (my + height * 6 / 7) + "px" }, SPEED, "linear")
    $("#back").transition({ y: (by + height * 5 / 7) + "px" }, SPEED, "linear")
    flower_height += height;
    my += height * 6 / 7;
    by += height * 5 / 7;

    $("#water-text").html("+" + `${volume}` + "ml")
    $("#water-text").addClass("run-drink")
    setTimeout(() => {
        $("#water-text").removeClass("run-drink")
        isGrowing = false;
    }, TEXT_SPEED);
}

function renderFlowerVine(flowerX, flowerY) {
    noFill();
    stroke(2, 98, 0);
    strokeWeight(13);

    bezier(
        windowWidth / 2 - 10, windowHeight + flower_height,
        windowWidth / 2 - 10, windowHeight + flower_height / 2,
        windowWidth / 2, windowHeight,
        flowerX, flowerY
    );
    bezier(
        windowWidth / 2, windowHeight + flower_height,
        windowWidth / 2, windowHeight + flower_height / 2,
        windowWidth / 2, windowHeight,
        flowerX, flowerY
    );
    bezier(
        windowWidth / 2 + 10, windowHeight + flower_height,
        windowWidth / 2 + 10, windowHeight + flower_height / 2,
        windowWidth / 2, windowHeight,
        flowerX, flowerY
    );
}

function renderFlower(flowerX, flowerY) {
    translate(flowerX, flowerY);
    noStroke();
    fill(251, 126, 126, 255);
    rotateRand = rotateRand + 0.005; // Change speed here
    var n = (noise(rotateRand) - 0.5);
    rotate(n);
    for (var i = 0; i < 10; i++) {
        rotate(PI / 5);
        ellipse(0, 100, 60, 160);
    }

    rotate(-PI / 5 * 10 - n);
    image(img, 0, 0);
}

function renderReminder() {
    const currentTime = new Date();
    const diffTime = int((currentTime - lastDrinkTime) / 1000);
    const diffSec = diffTime % 60;
    const diffMin = ((diffTime - diffSec) % (60 * 60)) / 60;
    const diffHour = ((diffTime - diffSec - diffMin * 60) % (60 * 60 * 24)) / (60 * 60);
    const diffDay = (diffTime - diffSec - diffMin * 60 - diffHour * 60 * 60) / (60 * 60 * 24);
    const textDay = int(diffDay) == 0 ? "" : int(diffDay) == 1 ? `${int(diffDay)}` + " day " : `${int(diffDay)}` + " days ";
    const textHour = int(diffHour) == 0 ? "" : int(diffHour) == 1 ? `${int(diffHour)}` + " hour " : `${int(diffHour)}` + " hours ";
    const textMin = int(diffMin) == 0 ? "" : int(diffMin) == 1 ? `${int(diffMin)}` + " minute " : `${int(diffMin)}` + " minutes ";
    const textSec = int(diffSec) == 0 ? "" : int(diffSec) == 1 ? `${int(diffSec)}` + " second " : `${int(diffSec)}` + " seconds ";


    $("#diff-time").html(textDay + textHour + textMin + textSec);
    if (((diffTime - diffSec) / 60) >= 60) {
        $(".warning").fadeIn().css("display", "flex");
    } else {
        if ($('.warning').css('display') != 'none') {
            $(".warning").fadeOut();
        }
    }
}