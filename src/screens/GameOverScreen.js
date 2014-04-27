(function (Ω) {

    "use strict";

    var GameOverScreen = Ω.Screen.extend({

        font: new Ω.Font("res/images/mamefont.png", 16, 16, "abcdefghijklmnopqrstuvwxyz0123456789 .,:!?'\"&<>$"),

        img: new Ω.Image("res/images/title.png"),

        init: function (manner, cash, levels) {

            this.manner = manner;
            this.cash = cash;
            this.levels = levels;

        },

        tick: function () {

        	if (this.frame > 160) {
        		window.game.setScreen(new window.TitleScreen());
        	}

        },

        render: function (gfx) {

            this.clear(gfx, "hsl(198, 68%, 52%)");

            if (this.manner === "CAPTURED") {
                this.font.render(gfx, "kicked off by the surf patrol.", Ω.env.w * 0.2 - 150, Ω.env.h / 2 - 8);
                this.font.render(gfx, "and really embarrassed.", Ω.env.w * 0.2 - 150, Ω.env.h / 2 + 10);
            } else {
                this.font.render(gfx, "you have gotten really thirsty.", Ω.env.w * 0.2 - 150, Ω.env.h / 2 - 8);
                this.font.render(gfx, "really really thirsty.", Ω.env.w * 0.2 - 150, Ω.env.h / 2 + 10);
            }

            this.font.render(gfx, "you earned $" + this.cash, Ω.env.w * 0.5 - 150, Ω.env.h / 2 + 32);
            //this.img.render(gfx, 0, 0);

        }

    });

    window.GameOverScreen = GameOverScreen;

}(window.Ω));