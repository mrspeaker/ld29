(function (Ω) {

    "use strict";

    var MainScreen = Ω.Screen.extend({

        init: function () {

            this.player = this.add(new window.Player(Ω.env.w * 0.5, Ω.env.h * 0.2));

        },

        tick: function () {

            // Randomly add a bad guy
            /*if (Ω.utils.oneIn(100)) {
                this.add(
                    new Baddie(this.player.x + (Ω.env.w / 2), Ω.utils.rand(0, Ω.env.h) | 0),
                    "baddies" // Add to "baddies" group
                );
            }*/

            //Ω.Physics.checkCollisions([this.get("baddies"), this.get("player-bullet")]);
            //Ω.Physics.checkCollision(this.player, this.get("baddies"));

        },

        render: function (gfx) {

            this.clear(gfx, "hsl(195, 40%, 5%)");

        }
    });

    window.MainScreen = MainScreen;

}(window.Ω));
