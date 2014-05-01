(function (Ω) {

    "use strict";

    var TitleScreen = Ω.Screen.extend({

        font: new Ω.Font("res/images/mamefont.png", 16, 16, "abcdefghijklmnopqrstuvwxyz0123456789 .,:!?'\"&<>$"),

        img: new Ω.Image("res/images/title.png"),

        tick () {

        	if (this.frame > 40 && Ω.input.pressed("fire")) {
        		window.game.setScreen(new window.MainScreen());
        	}

        },

        render (gfx) {

            this.img.render(gfx, 0, 0);

        }

    });

    window.TitleScreen = TitleScreen;

}(window.Ω));
