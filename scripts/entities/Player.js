(function (Ω, DIRS) {

    "use strict";

    var Player = Ω.Entity.extend({
        w: 24,
        h: 32,

        speed: {
            detect: 2,
            move: 3
        },

        sheet: new Ω.SpriteSheet("res/images/walkers.png", 24, 32),

        state: null,

        dir: DIRS.up,

        cash: 0,

        init: function (x, y, screen) {

            this._super(x, y);
            this.beach = screen.beach;
            this.screen = screen;
            this.anims = new Ω.Anims([
                new Ω.Anim("walkUp", this.sheet, 200, [[0, 0], [1, 0]]),
                new Ω.Anim("walkDown", this.sheet, 200, [[8, 0], [9, 0]]),
                new Ω.Anim("detectUp", this.sheet, 200, [[3, 0], [4, 0], [3, 0], [2, 0]]),
                new Ω.Anim("detectDown", this.sheet, 200, [[6, 0], [7, 0], [6, 0], [5, 0]]),
                new Ω.Anim("dig", this.sheet, 120, [[0, 1], [1, 1]]),
                new Ω.Anim("rockout", this.sheet, 120, [[2, 1], [3, 1]])
            ]);

            this.state = new Ω.utils.State("BORN");

        },

        reset: function () {
            this.state.set("BORN");
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
                    this.anims.set(("walk" + (this.dir === DIRS.up ? "Up" : "Down")));
                }
                this.tick_LOOKING();
                break;
            case "DIGGING":
                if (this.state.first()) {
                    this.anims.set("dig");
                    this.digging = true;
                }

                if (this.state.count === 10) {
                    this.beach.dig(this, 0);
                }
                if (this.state.count === 20) {
                    this.beach.dig(this, 1);
                }
                if (this.state.count === 30) {
                    this.beach.dig(this, 2);
                }
                if (this.state.count === 40) {
                    this.beach.dig(this, 3);
                }
                if (Ω.input.released("dig")) {
                    this.digging = false;
                    this.state.set("LOOKING");
                } else if (this.state.count > 50) {
                    this.digging = false;
                    var gets = this.beach.search(this, true);
                    if (gets) {
                        this.state.set("ROCKINGOUT", {treasure: gets});
                    } else {
                        console.log("Found squat.");
                    }
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
                this.anims.set(("detect" + (this.dir === DIRS.up ? "Up" : "Down")));
            }
            if (Ω.input.released("fire")) {
                this.detecting = false;
                this.anims.set(("walk" + (this.dir === DIRS.up ? "Up" : "Down")));
            }

            return true;

        },

        tick_LOOKING: function () {

            var xo = 0,
                yo = 0,
                speed = this.detecting ? this.speed.detect : this.speed.move;

            if (!this.digging) {
                if (Ω.input.isDown("left")) {
                    xo -= speed;
                }
                if (Ω.input.isDown("right")) {
                    xo += speed;
                }
                if (Ω.input.isDown("up")) {
                    this.dir = DIRS.up;
                    yo -= speed;
                }
                if (Ω.input.isDown("down")) {
                    this.dir = DIRS.down;
                    yo += speed;
                }

                if (Ω.input.pressed("up")) {
                    this.anims.set(this.detecting ? "detectUp" : "walkUp");
                }
                if (Ω.input.pressed("down")) {
                    this.anims.set(this.detecting ? "detectDown" : "walkDown");
                }
            }

            this.move(xo, yo, this.beach.map);

            //this.x += xo;
            //this.y += yo;

            if (this.detecting || xo || yo) {
                this.anims.tick();
            }

            if (this.detecting) {
                // TODO: searches every frame... not just once.
                var gets = this.beach.search(this);
                if (gets) {
                    this.add(new window.Blip(this.x, this.y));
                }
            }

            // Better if it was "isdown" and abort when
            if (Ω.input.pressed("dig")) {
                // TODO: searches every frame... not just once.
                var gets$0 = this.beach.search(this, false);
                if (gets$0) {
                    this.state.set("DIGGING", {treasure: gets$0});
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

}(window.Ω, window.DIRS));
