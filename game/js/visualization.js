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
const COLOR_ARRAY = ['#C1C6E4', '#FFAD80', '#9C87B8', '#FB7E7E', '#B2DAFF', '#D6FAA8'];
const WEEK_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function makeList(element, index, list) {
    $("#entries-list").append()
}

function preload() {
    readPreviousState();
}

function setup() {
    pollLatestStateAndFindDiff();
    flower_height = getHeightFromState(currentState);
    console.log(flower_height);
    setFlowerHeight(flower_height);

    createCanvas(windowWidth, windowHeight);
    img = loadImage('assets/Cat' + str(currentState.cat_index) + '.png');
    flower_color = COLOR_ARRAY[currentState.flower_index]
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

            const drinking_activity_date = WEEK_DAYS[new Date(drinking_activity.time).getDay()];
            currentState[drinking_activity_date].activities.push(drinking_activity);
            currentState[drinking_activity_date].total_volume += drinking_activity.volume;
            putStateAsPreviousState(currentState);
            switchReminderLight(false);
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

function getSunday(date)   {
    var sunday = new Date(date.setDate(date.getDate() - date.getDay()));
    return new Date(sunday.getTime() - (sunday.getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
}


function readPreviousState() {
    day_of_week = getDayOfWeek();
    var url = "https://cupholder-de568.firebaseio.com/previous_state.json"
    return loadJSON(url, (res) => {
        currentState = res;
        WEEK_DAYS.forEach((day) => {
            if (!_.has(currentState, day)) {
                currentState[day] = {
                    "activities": [],
                    "total_volume": 0
                }
            }
        })
        putStateAsPreviousState(currentState);
    });
}

function pollLatestStateAndFindDiff() {
    var datestring = getSunday(new Date());
    var url = "https://cupholder-de568.firebaseio.com/" + datestring + ".json"
    return loadJSON(url, pushLatestChangeToAnimationQueue);
}

async function pushLatestChangeToAnimationQueue(latestState) {


    current_activities = getAllDrinkingActivitiesFromState(currentState);
    latest_activities = getAllDrinkingActivitiesFromState(latestState);

    const registered_activity_length = current_activities.length + pending_animation_queue.length;

    if (latest_activities.length < registered_activity_length) {
        throw "Latest state length smaller than previous state. Corrupt data!";
    }

    for (var i = registered_activity_length; i < latest_activities.length; i++) {
        pending_animation_queue.push(latest_activities[i]);
    }
}

function getAllDrinkingActivitiesFromState(state) {
    var activities = [];
    WEEK_DAYS.forEach((day) => {
        if (_.has(state, day) && state[day].activities != undefined) {
            activities = activities.concat(state[day].activities);
        }
    });
    return activities;
}

function getHeightFromState(state) {
    var volume = 0;
    WEEK_DAYS.forEach((day) => {
        if (_.has(state, day)) {
            volume += state[day].total_volume;
            $("#total-volume").html(volume);
        }
    })

    var height = getHeightFromVolume(volume);
    return height;
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

    isGrowing = true;
    const height = getHeightFromVolume(volume);

    $("#front").transition({ y: flower_height + height + "px" }, SPEED, "linear")
    $("#mid").transition({ y: (my + height * 6 / 7) + "px" }, SPEED, "linear")
    $("#back").transition({ y: (by + height * 5 / 7) + "px" }, SPEED, "linear")
    flower_height += height;
    my += height * 6 / 7;
    by += height * 5 / 7;

    var current_total = int($("#total-volume").text());
    $("#total-volume").html(volume+current_total);
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
    fill(flower_color);
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
        switchReminderLight(true);
    } else {
        if ($('.warning').css('display') != 'none') {
            $(".warning").fadeOut();
        }
    }
}

function putStateAsPreviousState(state) {
    return $.ajax({
        type: "PUT",
        url: "https://cupholder-de568.firebaseio.com/previous_state.json",
        data: JSON.stringify(state),
        success: (response) => {
            //console.log(response);
        }
    });
}

function switchReminderLight(isLightOn) {
    return $.ajax({
        type: "PATCH",
        url: "https://cupholder-de568.firebaseio.com/.json",
        data: JSON.stringify({"light": isLightOn}),
        success: (response) => {
            // console.log(response);
        }
    });
}

function getDayOfWeek() {
    var d = new Date();
    return WEEK_DAYS[d.getDay()];
}