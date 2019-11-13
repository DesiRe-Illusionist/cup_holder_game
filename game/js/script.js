fy = 0;
my = 0;
by = 0;
dec = 300;
speed = 800;
effect = "linear";
$(document).on("keydown", (e) => {
    if (e.which == 38) {
        //UP
        if (fy + dec <= 7000) {
            $("#front").transition({ y: fy + dec + "px" }, speed, effect)
            $("#mid").transition({ y: (my + dec * 6 / 7) + "px" }, speed, effect)
            $("#back").transition({ y: (by + dec * 5 / 7) + "px" }, speed, effect)
            fy += dec;
            my += dec * 6 / 7;
            by += dec * 5 / 7;
        } 
        e.preventDefault();
        $("#water-text").addClass("run-drink")
        setTimeout(() => {
            $("#water-text").removeClass("run-drink")
        }, speed);
    } else if (e.which == 40) {
        //DOWN
        if (fy - dec >= 0) {
            $("#front").transition({ y: fy - dec + "px" }, speed, effect)
            $("#mid").transition({ y: (my - dec * 6 / 7) + "px" }, speed, effect)
            $("#back").transition({ y: (by - dec * 5 / 7) + "px" }, speed, effect)
            fy -= dec;
            my -= dec * 6 / 7;
            by -= dec * 5 / 7;
        }
    } else if (e.which == 39) {
        /*
         e.preventDefault();
         $("#water-text").removeClass("run-drink")
         void document.getElementById("#water-text").offsetWidth;
         $("#water-text").addClass("run-drink")
        */
    } else if (e.which == 37) {
        e.preventDefault();
        $("#water-text").addClass("run-drink")
        setTimeout(() => {
            $("#water-text").removeClass("run-drink")
        }, speed);
    }
    return false;
})
