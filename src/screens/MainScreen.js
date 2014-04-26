(function (Ω) {

    "use strict";

    var MainScreen = Ω.Screen.extend({

        font: new Ω.Font("res/images/mamefont.png", 16, 16, "abcdefghijklmnopqrstuvwxyz0123456789 .,:!?'\"&<>$"),

        init: function () {

            this.beach = this.add(new window.Beach(40, 10));
            this.add(this.beach.map, "map", 1);
            this.player = this.add(new window.Player(Ω.env.w * 0.5, Ω.env.h * 0.2, this.beach));
            this.camera = new Ω.Camera(0, 0, Ω.env.w, Ω.env.h - 100);

            [this.add(new window.BeachBum(
                Ω.math.snap(Ω.utils.rand(Ω.env.w), 32),
                Ω.math.snap(Ω.utils.rand(Ω.env.h - 96), 32) + 32
            ), "extras", 2) for (x of [1,2,3,4,5])];

            this.add(new window.SurfPatrol(Ω.env.w, 10, this.player));

        },

        tick: function () {

            this.beach.ticka(this.camera);

            this.camera.moveTo(
                this.beach.pos.x,
                this.beach.pos.y
            );

        },

        render: function (gfx) {

            this.clear(gfx, "hsl(198, 68%, 52%)");

        },

        renderPost: function (gfx) {

            var c = gfx.ctx,
                top = Ω.env.h - 100;

            c.fillStyle = "hsl(200, 40%, 20%)";
            c.fillRect(0, top, Ω.env.w, 100);

            this.font.render(gfx, "cash: $" + this.player.cash, 16, top + 16);

        }

    });

    window.MainScreen = MainScreen;

}(window.Ω));
