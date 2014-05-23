(function (Ω, DIRS) {

    "use strict";

    var Player = Ω.Entity.extend({
        w: 18,
        h: 20,

        center: null,

        getCenter () {
            let {x, y, center} = this;
            return [x + center.x, y + center.y];
        },

        speed: {
            detect: 2,
            move: 3
        },

        sheet: new Ω.SpriteSheet("res/images/walkers.png", 24, 32),

        state: null,

        dir: DIRS.up,

        lastDrink: 0,
        drinkOk: false,

        lastBlip: 0,

        cash: 0,
        hydration: 100,
        dehydrate: 0.1, // (geddit? dehyd...rate!)
        hydrationWarning: false,

        sounds: {
            blip: new Ω.Sound("res/audio/ping", 1, false),
            cash: new Ω.Sound("res/audio/cashcashmoney", 1, false),
            coin: new Ω.Sound("res/audio/collect", 1, false),
            thirsty: new Ω.Sound("res/audio/thirsty", 1, true),
            click: new Ω.Sound("res/audio/build", 1, false)
        },

        init (x, y, screen) {

            this._super(x, y);
            this.beach = screen.beach;
            this.screen = screen;

            let sheet = this.sheet;
            this.anims = new Ω.Anims([
                new Ω.Anim("detectUp", sheet, 150, [[3, 0], [4, 0], [3, 0], [2, 0]]),
                new Ω.Anim("detectDown", sheet, 150, [[6, 0], [7, 0], [6, 0], [5, 0]]),
                new Ω.Anim("detectLeft", sheet, 150, [[5, 1], [6, 1], [5, 1], [4, 1]]),
                new Ω.Anim("detectRight", sheet, 150, [[8, 1], [9, 1], [8, 1], [7, 1]]),
                new Ω.Anim("dig", sheet, 120, [[0, 1], [1, 1]]),
                new Ω.Anim("rockout", sheet, 120, [[2, 1], [3, 1]]),
                new Ω.Anim("beer", sheet, 100, [[4, 2], [5, 2]])
            ]);

            this.center = {
                x: this.w / 2,
                y: this.h / 2
            }

            this.state = new Ω.utils.State("BORN");

        },

        reset () {
            this.state.set("BORN");
        },

        tick () {
            let {state, anims, sounds, screen, beach} = this;

            state.tick();
            let count = state.count;

            switch(state.get()) {

            case "BORN":
                state.set("IDLE");
                break;

            case "IDLE":
                state.set("LOOKING");
                break;

            case "LOOKING":
                if (state.first()) {
                    anims.set(`detect${ this.dir === DIRS.up ? "Up" : "Down"}`);
                }
                this.tick_LOOKING();
                break;

            case "DIGGING":
                if (state.first()) {
                    anims.set("dig");
                    this.digging = true;
                }

                // Do hole animation
                if (count < 41 && count % 10 === 0) {
                    beach.dig(this, (count / 10) - 1);
                }

                if (Ω.input.released("fire")) {
                    this.digging = false;
                    state.set("LOOKING");
                } else if (count > 50) {
                    this.digging = false;
                    let gets = beach.search(this, true);
                    if (gets) {
                        state.set("ROCKINGOUT", {treasure: gets});
                    } else {
                        console.log("Found squat.");
                    }
                }
                this.anims.tick();
                break;

            case "ROCKINGOUT":
                if (state.first()) {
                    anims.set("rockout");
                    sounds.cash.play();
                    sounds.coin.play();
                    this.cash += state.data.treasure;
                }
                anims.tick();
                if (count > 60) {
                    state.set("LOOKING");
                }
                break;

            case "DRINKING":
                if (state.first()) {
                    this.cash -= 1;
                    anims.set("beer");
                }
                if (count > 60) {
                    this.hydration = Math.min(100, this.hydration + 75);
                    state.set("LOOKING");
                }
                anims.tick();
                break;

            case "CAPTURED":
                if (count > 100) {
                    screen.gameover("CAPTURED");
                }
                break;

            case "DEHYDRATED":
                if (count > 100) {
                    screen.gameover("DEHYDRATED");
                }
                break;
            }

            return true;

        },

        tick_LOOKING () {
            let { x, y, w, h, anims, beach, state, sounds } = this;

            let xo = 0,
                yo = 0,
                speed = this.detecting ? this.speed.detect : this.speed.move;

            if (Ω.input.isDown("left")) xo -= speed;
            if (Ω.input.isDown("right")) xo += speed;
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

            if (Ω.input.pressed("up")) anims.set("detectUp");
            if (Ω.input.pressed("down")) anims.set("detectDown");
            if (Ω.input.pressed("left")) anims.set("detectLeft");
            if (Ω.input.pressed("right")) anims.set("detectRight");

            let [xm, ym] = this.move(xo, yo, beach.map);
            if (xm || ym) {
                anims.tick();

                // Constrain to beach.
                if (x < 0) x = 0;
                if (x > beach.w - w) x = beach.w - w;
                if (y > beach.h - h) y = beach.h - h;
            }

            // TODO: searches every frame... not just once.
            let gets = beach.search(this);
            if (gets && Ω.utils.now() - this.lastBlip > 30) {
                sounds.blip.play();
                this.add(new window.Blip(x, y));
                this.lastBlip = Ω.utils.now();
            }

            if (Ω.input.pressed("fire")) {
                // TODO: searches every frame... not just once.
                let gets = beach.search(this, false);
                if (gets) {
                    state.set("DIGGING", {treasure: gets});
                    this.drinkOk = false;
                } else {
                    this.drinkOk = true;
                }
            } else {
                if (Ω.input.isDown("fire")) {
                    Ω.Physics.checkCollision(this, beach.stands, "drink");
                }
            }

            this.hydration -= this.dehydrate;
            if (!this.hydrationWarning && this.hydration < 20) {
                sounds.thirsty.play();
                this.hydrationWarning = true;
            } else if (this.hydrationWarning && this.hydration > 20) {
                sounds.thirsty.stop();
                this.hydrationWarning = false;
            }

            if (this.hydration < 0) {
                this.screen.predead();
                state.set("DEHYDRATED");
            }

            return true;
        },

        hit () {
            if (this.state.isNot("CAPTURED")) {
                this.screen.predead();
                this.state.set("CAPTURED");
            }
        },

        drink () {
            if (!this.drinkOk) {
                return;
            }

            if (this.cash < 1) {
                this.sounds.click.play();
                return;
            }

            this.sounds.coin.play();

            let now = Ω.utils.now();
            if (now - this.lastDrink > 1500) {
                this.state.set("DRINKING");
                this.lastDrink = now;
            }
        },

        render (gfx) {

            this.anims.render(gfx, this.x - 3, this.y - 16);

        }

    });

    window.Player = Player;

}(window.Ω, window.DIRS));
