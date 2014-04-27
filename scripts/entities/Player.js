(function (Ω) {

    "use strict";

    var Player = Ω.Entity.extend({
        w: 24,
        h: 32,

        speed: {
            detect: 2,
            move: 2.5
        },

        sheet: new Ω.SpriteSheet("res/images/walkers.png", 24, 32),

        state: null,

        cash: 0,

        init: function (x, y, screen) {

            this._super(x, y);
            this.beach = screen.beach;
            this.screen = screen;
            this.anims = new Ω.Anims([
                new Ω.Anim("walk", this.sheet, 200, [[0, 0], [1, 0]]),
                new Ω.Anim("detect", this.sheet, 200, [[0, 0], [1, 0]]),
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
                this.state.set("LOOKING");
                break;
            case "LOOKING":
                if (this.state.first()) {
                    this.anims.set("walk");
                }
                this.tick_LOOKING();
                break;
            case "DIGGING":
                if (this.state.first()) {
                    this.anims.set("dig");
                }
                if (this.state.count > 50) {
                    this.state.set("ROCKINGOUT", this.state.data);
                }
                this.anims.tick();
                break;
            case "ROCKINGOUT":
                if (this.state.first()) {
                    this.anims.set("rockout");
                    this.cash += this.state.data.treasure;
                }
                this.anims.tick();
                if (this.state.count > 60) {
                    this.state.set("LOOKING");
                }
                break;
            case "CAPTURED":
                if (this.state.count > 100) {
                    this.screen.captured();
                }
                break;
            }

            if (Ω.input.pressed("fire")) {
                this.detecting = true;
            }
            if (Ω.input.released("fire")) {
                this.detecting = false;
            }

            return true;

        },

        tick_LOOKING: function () {

            var xo = 0,
                yo = 0,
                speed = this.detecting ? this.speed.detect : this.speed.move;

            if (Ω.input.isDown("left")) {
                xo -= speed;
            }
            if (Ω.input.isDown("right")) {
                xo += speed;
            }
            if (Ω.input.isDown("up")) {
                yo -= speed;
            }
            if (Ω.input.isDown("down")) {
                yo += speed;
            }

            this.x += xo;
            this.y += yo;

            if (xo  || yo) {
                this.anims.tick();
            }

            if (this.detecting) {
                // TODO: searches every frame... not just once.
                var gets = this.beach.search(this);
                if (gets) {
                    this.state.set("DIGGING", {treasure: gets});
                    return true;
                }
            }

            return true;
        },

        hit: function () {
            if (this.state.isNot("CAPTURED")) {
                this.state.set("CAPTURED");
            }
        },

        render: function (gfx) {

            var c = gfx.ctx;

            this.anims.render(gfx, this.x, this.y);

        }

    });

    window.Player = Player;

}(window.Ω));
