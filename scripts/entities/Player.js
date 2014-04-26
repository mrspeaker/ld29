(function (Ω) {

    "use strict";

    var Player = Ω.Entity.extend({
        w: 24,
        h: 32,

        speed: {
            detect: 0.5,
            move: 2.4
        },

        sheet: new Ω.SpriteSheet("res/images/walkers.png", 24, 32),

        state: null,

        cash: 0,

        init: function (x, y, beach) {

            this._super(x, y);
            this.beach = beach;
            this.anims = new Ω.Anims([
                new Ω.Anim("walk", this.sheet, 120, [[0, 0], [1, 0]]),
                new Ω.Anim("dig", this.sheet, 120, [[0, 1], [1, 1]]),
                new Ω.Anim("rockout", this.sheet, 120, [[0, 1], [0, 10]])
            ]);

            this.state = new Ω.utils.State("BORN");

        },

        tick: function () {

            this.state.tick();
            switch(this.state.get()) {
            case "BORN":
                this.state.set("IDLE");
                break;
            case "IDLE":
                if (this.beach.path.length) {
                    this.state.set("LOOKING");
                }
                break;
            case "LOOKING":
                if (this.state.first()) {
                    this.anims.set("walk");
                }
                if (this.beach.path.length === 0) {
                    this.state.set("IDLE");
                } else {
                    this.tick_LOOKING();
                }
                break;
            case "DIGGING":
                if (this.state.first()) {
                    this.anims.set("dig");
                }
                if (this.state.count > 50) {
                    console.log("YOu got!", this.state.data.treasure);
                    this.state.set("ROCKINGOUT");
                }
                this.anims.tick();
                break;
            case "ROCKINGOUT":
                if (this.state.first()) {
                    this.anims.set("rockout");
                }
                this.anims.tick();
                if (this.state.count > 60) {
                    this.state.set("LOOKING");
                }

                break;
            }

            return true;

        },

        tick_LOOKING: function () {

            var xo = 0,
                yo = 0,
                target = this.beach.path[0],
                speed = this.beach.pathStarted ? this.speed.detect : this.speed.move;


            if (Math.abs(target[0] - this.x) > 5) {
                if (target[0] - this.x < 5) { xo -= speed; }
                else if (target[0] - this.x > 5) { xo += speed; }
            } else
            if (Math.abs(target[1] - this.y) > 5) {
                if (target[1] - this.y < 5) { yo -= speed; }
                else if (target[1] - this.y > 5) { yo += speed; }
            }

            if (!(xo || yo)) {

                var gets = this.beach.search();
                if (gets) {
                    this.state.set("DIGGING", {treasure: gets});
                    return true;
                }

                if (this.beach.path.length === 0) {
                    this.state.set("IDLE");
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
