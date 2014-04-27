(function (Ω) {

    "use strict";

    var TitleScreen = Ω.Screen.extend({

        font: new Ω.Font("res/images/mamefont.png", 16, 16, "abcdefghijklmnopqrstuvwxyz0123456789 .,:!?'\"&<>$"),

        img: new Ω.Image("res/images/title.png"),

        init: function () {

        },

        tick: function () {

        	if (this.frame > 40 && Ω.input.pressed("fire")) {
        		window.game.setScreen(new window.MainScreen());
        	}

        },

        render: function (gfx) {

            this.clear(gfx, "hsl(198, 68%, 52%)");

            //this.font.render(gfx, "metal meter madness", Ω.env.w * 0.5 - 150, Ω.env.h / 2 - 8);
            this.img.render(gfx, 0, 0);

        }

    });

    window.TitleScreen = TitleScreen;

}(window.Ω));