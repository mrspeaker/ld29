(function (Ω) {

    "use strict";

    var MainScreen = Ω.Screen.extend({

        init: function () {

            this.beach = new window.Beach(40, 10);
            this.add(this.beach.map, "map", 1);
            this.player = this.add(new window.Player(Ω.env.w * 0.5, Ω.env.h * 0.2, this.beach));
            this.camera = new Ω.Camera(0, 0, Ω.env.w, Ω.env.h);

        },

        tick: function () {

            this.beach.tick(this.camera);

            // Center camera on player
            this.camera.moveTo(
                this.player.x - (Ω.env.w / 2),
                this.player.y - (Ω.env.h / 2)
            );

        },

        render: function (gfx) {

            this.clear(gfx, "hsl(200, 40%, 45%)");

        }
    });

    window.MainScreen = MainScreen;

}(window.Ω));
