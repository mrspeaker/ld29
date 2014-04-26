(function (Ω) {

    "use strict";

    var Player = Ω.Entity.extend({
        w: 24,
        h: 32,
        speed: 4,

        sheet: new Ω.SpriteSheet("res/images/walkers.png", 24, 32),

        init: function (x, y) {

            this._super(x, y);

            this.anims = new Ω.Anims([
                new Ω.Anim("walk", this.sheet, 60, [[0, 0], [1, 0]])
            ]);

        },

        tick: function () {

            var xo = 0,
                yo = 0;

            if (Ω.input.isDown("left")) { xo -= this.speed; }
            if (Ω.input.isDown("right")) { xo += this.speed; }
            if (Ω.input.isDown("up")) { yo -= this.speed; }
            if (Ω.input.isDown("down")) { yo += this.speed; }

            this.x += xo;
            this.y += yo;

            if (xo  || yo) {
                this.anims.tick();
            }

            return true;
        },

        render: function (gfx) {

            var c = gfx.ctx;

            this.anims.render(gfx, this.x, this.y);

        }

    });

    window.Player = Player;

}(window.Ω));
