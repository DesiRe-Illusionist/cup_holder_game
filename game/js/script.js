dec = 300;
effect = "linear";
$(document).on("keydown", (e) => {
    if (e.which == 38) {
        //UP
        if (flower_height + dec <= 7000) {
            $("#front").transition({ y: flower_height + dec + "px" }, SPEED, effect)
            $("#mid").transition({ y: (my + dec * 6 / 7) + "px" }, SPEED, effect)
            $("#back").transition({ y: (by + dec * 5 / 7) + "px" }, SPEED, effect)
            flower_height += dec;
            my += dec * 6 / 7;
            by += dec * 5 / 7;
        } 
        e.preventDefault();
        $("#water-text").addClass("run-drink")
        setTimeout(() => {
            $("#water-text").removeClass("run-drink")
        }, TEXT_SPEED);
    } else if (e.which == 40) {
        //DOWN
        if (flower_height - dec >= 0) {
            $("#front").transition({ y: flower_height - dec + "px" }, SPEED, effect)
            $("#mid").transition({ y: (my - dec * 6 / 7) + "px" }, SPEED, effect)
            $("#back").transition({ y: (by - dec * 5 / 7) + "px" }, SPEED, effect)
            flower_height -= dec;
            my -= dec * 6 / 7;
            by -= dec * 5 / 7;
        }
    } else if (e.which == 37) {
        e.preventDefault();
        $("#water-text").addClass("run-drink")
        setTimeout(() => {
            $("#water-text").removeClass("run-drink")
        }, TEXT_SPEED);
    }
    return false;
})
