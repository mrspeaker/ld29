(function (Ω) {

    "use strict";

    var TitleScreen = Ω.Screen.extend({

        font: new Ω.Font("res/images/mamefont.png", 16, 16, "abcdefghijklmnopqrstuvwxyz0123456789 .,:!?'\"&<>$"),

        init: function () {

        },

        tick: function () {

        	if (this.frame > 60) {
        		window.game.setScreen(new window.MainScreen());
        	}

        },

        render: function (gfx) {

            this.clear(gfx, "hsl(198, 68%, 52%)");

            this.font.render(gfx, "metal meter madness", Ω.env.w * 0.5 - 150, Ω.env.h / 2 - 8);

        }

    });

    window.TitleScreen = TitleScreen;

}(window.Ω));