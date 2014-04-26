(function (Ω) {

    "use strict";

    var Player = Ω.Entity.extend({
        w: 24,
        h: 32,

        speed: {
            detect: 1,
            move: 4
        },

        sheet: new Ω.SpriteSheet("res/images/walkers.png", 24, 32),

        init: function (x, y, beach) {

            this._super(x, y);

            this.anims = new Ω.Anims([
                new Ω.Anim("walk", this.sheet, 60, [[0, 0], [1, 0]])
            ]);

            this.beach = beach;

        },

        tick: function () {

            var xo = 0,
                yo = 0,
                target = this.beach.path[0],
                speed = this.beach.pathStarted ? this.speed.detect : this.speed.move;

            if (target) {

                if (Math.abs(target[0] - this.x) > 5) {
                    if (target[0] - this.x < 5) { xo -= speed; }
                    else if (target[0] - this.x > 5) { xo += speed; }
                } else
                if (Math.abs(target[1] - this.y) > 5) {
                    if (target[1] - this.y < 5) { yo -= speed; }
                    else if (target[1] - this.y > 5) { yo += speed; }
                }

                if (!(xo || yo)) {
                    this.beach.searched();
                }

            }

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
