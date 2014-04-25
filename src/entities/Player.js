(function (Ω) {

    "use strict";

    var Player = Ω.Entity.extend({
        w: 24,
        h: 32,
        speed: 4,

        init: function (x, y) {

            this._super(x, y);

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

            return true;
        },

        render: function (gfx) {

            var c = gfx.ctx;

            c.fillStyle = "#333";
            c.fillRect(this.x, this.y, this.w, this.h);

        }

    });

    window.Player = Player;

}(window.Ω));
