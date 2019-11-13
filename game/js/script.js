fy = 0;
my = 0;
by = 0;
dec = 300;
$(document).on("keydown", (e) => {
    if (e.which == 38) {
        //UP
        if (fy + dec <= 7000) {
            $("#front").transition({ y: fy + dec + "px" }, "linear")
            $("#mid").transition({ y: (my + dec * 6 / 7) + "px" }, "linear")
            $("#back").transition({ y: (by + dec * 5 / 7) + "px" }, "linear")
            fy += dec;
            my += dec * 6 / 7;
            by += dec * 5 / 7;
        } else {
        }
    } else if (e.which == 40) {
        //DOWN
        if (fy - dec >= 0) {
            $("#front").transition({ y: fy - dec + "px" }, "linear")
            $("#mid").transition({ y: (my - dec * 6 / 7) + "px" }, "linear")
            $("#back").transition({ y: (by - dec * 5 / 7) + "px" }, "linear")
            fy -= dec;
            my -= dec * 6 / 7;
            by -= dec * 5 / 7;
        }
    }
    return false;
})
