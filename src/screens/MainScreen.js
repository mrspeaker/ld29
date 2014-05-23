(function (Ω) {

    "use strict";

    var MainScreen = Ω.Screen.extend({

        font: new Ω.Font("res/images/mamefont.png", 16, 16, "abcdefghijklmnopqrstuvwxyz0123456789 .,:!?'\"&<>$"),

        hud: new Ω.Image("res/images/hud.png"),
        horizon: new Ω.Image("res/images/horizon.png"),

        sounds: {
            tune: new Ω.Sound("res/audio/tune", 0.8, true),
            dead: new Ω.Sound("res/audio/doh", 1, false)
        },

        state: null,
        autoTick: false,
        curTime: 0,

        curLevel: 0,
        maxLevel: 2,

        cashcashmoney: 0,

        init () {

            Ω.Sound._setVolume(0);
            this.reset();

        },

        reset () {

            if (this.curLevel++ > this.maxLevel) {
                this.curLevel = 1;
            }

            this.removeAll();

            var env = {
                x:0,
                y:0,
                w:Ω.env.w,
                h:Ω.env.h - 64
            };

            this.camera = new Ω.Camera(0, 0, Ω.env.w, Ω.env.h - 64);

            this.beach = this.add(new window.Beach(this.curLevel, env, () => {

                this.add(this.beach.map, "map", 1);
                this.player = this.add(new window.Player(
                    this.beach.playerSpawn.x,
                    this.beach.playerSpawn.y,
                    this
                ));
                this.beach.setPlayer(this.player);

                this.cop = this.add(new window.SurfPatrol(
                    this.beach.copSpawn.x,
                    this.beach.copSpawn.y,
                    this
                ));


            }));

            this.state = new Ω.utils.State("BORN");

        },

        tick () {

            let { state, beach, player } = this;

            state.tick();

            switch (state.get()) {

            case "BORN":
                if (beach.loaded) {
                    state.set("DAYBREAK");
                }
                break;

            case "DAYBREAK":
                if (state.first()) {
                    this.sounds.tune.stop();
                    this.tick_DAY();
                }
                if (state.count === 30) {
                    this.curTime = 0;
                    window.game.setDialog(new window.PopupDialog("  dig and drink."));
                    state.set("DAY");
                }
                break;

            case "DAY":
                if (state.first()) {
                    this.sounds.tune.play();
                }
                this.curTime++;
                this.tick_DAY();
                break;

            case "SUNSET":
                // No more "days"... maybe v2.
                if (state.first()) {
                    this.cashcashmoney += player.cash;
                    player.cash = 0;
                    window.game.setDialog(new window.PopupDialog("day is done."));

                }
                if (state.count > 10) {
                    this.reset();
                }
                break;

            case "CLEARED":
                if (state.first()) {
                    Ω.Sound._reset();
                    player.sounds.coin.play();
                    this.cashcashmoney += player.cash;
                    player.cash = 0;
                    window.game.setDialog(new window.PopupDialog("level clear!"));
                }
                if (state.count === 10) {
                    this.reset();
                }
                break;

            case "GAMEOVER":
                window.game.setScreen(
                    new window.GameOverScreen(
                        state.data.manner,
                        this.cashcashmoney + player.cash
                    )
                );
                break;
            }

        },

        tick_DAY () {

            this.tickBodies();

            this.camera.moveTo(
                this.beach.pos.x,
                this.beach.pos.y
            );

            if (this.cop.state.is("CHASE")) {
                Ω.Physics.checkCollision(this.player, [this.cop]);
            }

            if (this.beach.toDig === 0) {
                this.state.set("CLEARED");
            }
        },


        predead () {
            Ω.Sound._reset();
            this.sounds.tune.stop();
            this.sounds.dead.play();
        },

        /* jshint ignore:start */
        gameover (manner) {
            this.state.set("GAMEOVER", {manner});
        },
        /* jshint ignore:end */

        render (gfx) {

            this.clear(gfx, "hsl(198, 68%, 52%)");

        },

        renderPost (gfx) {

            let top = gfx.h - 70;

            this.horizon.render(gfx, 0, - this.camera.y - 90);
            this.hud.render(gfx, 0, top - 20);

            this.font.render(gfx, "cash: $" + (this.cashcashmoney + this.player.cash), 16, top + 16);
            this.font.render(gfx, "hydration: " + (this.player.hydration | 0) + "%", 16, top + 36);

        }

    });

    window.MainScreen = MainScreen;

}(window.Ω));
