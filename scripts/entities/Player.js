(function (Ω, DIRS) {

    "use strict";

    var Player = Ω.Entity.extend({
        w: 24,
        h: 20,

        center: null,

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
                new Ω.Anim("detectUp", this.sheet, 150, [[3, 0], [4, 0], [3, 0], [2, 0]]),
                new Ω.Anim("detectDown", this.sheet, 150, [[6, 0], [7, 0], [6, 0], [5, 0]]),
                new Ω.Anim("detectLeft", this.sheet, 150, [[5, 1], [6, 1], [5, 1], [4, 1]]),
                new Ω.Anim("detectRight", this.sheet, 150, [[8, 1], [9, 1], [8, 1], [7, 1]]),
                new Ω.Anim("dig", this.sheet, 120, [[0, 1], [1, 1]]),
                new Ω.Anim("rockout", this.sheet, 120, [[2, 1], [3, 1]])
            ]);

            this.center = {
                x: this.w / 2,
                y: this.h / 2
            }

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
                    this.anims.set(("detect" + (this.dir === DIRS.up ? "Up" : "Down")));
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
                if (Ω.input.released("fire")) {
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
                this.dir = DIRS.up;
                yo -= speed;
            }
            if (Ω.input.isDown("down")) {
                this.dir = DIRS.down;
                yo += speed;
            }

            if (xo !== 0 && yo !== 0) {
                xo /= Math.sqrt(2);
                yo /= Math.sqrt(2);
            }

            if (Ω.input.pressed("up")) {
                this.anims.set("detectUp");
            }
            if (Ω.input.pressed("down")) {
                this.anims.set("detectDown");
            }
            if (Ω.input.pressed("left")) {
                this.anims.set("detectLeft");
            }
            if (Ω.input.pressed("right")) {
                this.anims.set("detectRight");
            }

            var xm = (ym = this.move(xo, yo, this.beach.map))[0], ym = ym[1];

            if (xm || ym) {
                this.anims.tick();

                // Constrain to beach.
                if (this.x < 0) this.x = 0;
                if (this.x > this.beach.w - this.w) this.x = this.beach.w - this.w;
                if (this.y > this.beach.h - this.h) this.y = this.beach.h - this.h;
            }

            // TODO: searches every frame... not just once.
            var gets = this.beach.search(this);
            if (gets) {
                this.add(new window.Blip(this.x, this.y));
            }

            if (Ω.input.pressed("fire")) {
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

            this.anims.render(gfx, this.x, this.y - 16);

            /*c.strokeStyle = "#000";
            c.fillStyle = "#000";
            c.fillRect(this.x + this.center.x - 1, this.y + this.center.y - 1, 2, 2);
            c.strokeRect(this.x, this.y, this.w, this.h);*/

        }

    });

    window.Player = Player;

}(window.Ω, window.DIRS));
