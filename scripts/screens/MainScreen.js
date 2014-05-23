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

        init: function () {

            Ω.Sound._setVolume(0);
            this.reset();

        },

        reset: function () {var this$0 = this;

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

            this.beach = this.add(new window.Beach(this.curLevel, env, function()  {

                this$0.add(this$0.beach.map, "map", 1);
                this$0.player = this$0.add(new window.Player(
                    this$0.beach.playerSpawn.x,
                    this$0.beach.playerSpawn.y,
                    this$0
                ));
                this$0.beach.setPlayer(this$0.player);

                this$0.cop = this$0.add(new window.SurfPatrol(
                    this$0.beach.copSpawn.x,
                    this$0.beach.copSpawn.y,
                    this$0
                ));


            }));

            this.state = new Ω.utils.State("BORN");

        },

        tick: function () {

            this.state.tick();

            switch (this.state.get()) {
            case "BORN":
                if (this.beach.loaded) {
                    this.state.set("DAYBREAK");
                }
                break;
            case "DAYBREAK":
                if (this.state.first()) {
                    this.sounds.tune.stop();
                    this.tick_DAY();
                }
                if (this.state.count === 30) {
                    this.curTime = 0;
                    window.game.setDialog(new window.PopupDialog("  dig and drink."));
                    this.state.set("DAY");
                }
                break;
            case "DAY":
                if (this.state.first()) {
                    this.sounds.tune.play();
                }
                this.curTime++;
                //if (this.curTime / 2000 > 8) {
                    // Day over.
                //    this.state.set("SUNSET");
                //} else {
                    this.tick_DAY();
                //}
                break;
            case "SUNSET":
                // No more "days"... maybe v2.
                if (this.state.first()) {
                    this.cashcashmoney += this.player.cash;
                    this.player.cash = 0;
                    window.game.setDialog(new window.PopupDialog("day is done."));

                }
                if (this.state.count > 10) {
                    this.reset();
                }
                break;
            case "CLEARED":
                if (this.state.first()) {
                    Ω.Sound._reset();
                    this.player.sounds.coin.play();
                    this.cashcashmoney += this.player.cash;
                    this.player.cash = 0;
                    window.game.setDialog(new window.PopupDialog("level clear!"));
                }
                if (this.state.count === 10) {
                    this.reset();
                }
                break;

            case "GAMEOVER":
                window.game.setScreen(
                    new window.GameOverScreen(
                        this.state.data.manner,
                        this.cashcashmoney + this.player.cash
                    )
                );
                break;
            }

        },

        tick_DAY: function () {

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


        predead: function () {
            Ω.Sound._reset();
            this.sounds.tune.stop();
            this.sounds.dead.play();
        },

        /* jshint ignore:start */
        gameover: function (manner) {
            this.state.set("GAMEOVER", {manner: manner});
        },
        /* jshint ignore:end */

        render: function (gfx) {

            this.clear(gfx, "hsl(198, 68%, 52%)");

        },

        renderPost: function (gfx) {

            var top = gfx.h - 70;

            this.horizon.render(gfx, 0, - this.camera.y - 90);
            this.hud.render(gfx, 0, top - 20);

            this.font.render(gfx, "cash: $" + (this.cashcashmoney + this.player.cash), 16, top + 16);
            this.font.render(gfx, "hydration: " + (this.player.hydration | 0) + "%", 16, top + 36);

        }

    });

    window.MainScreen = MainScreen;

}(window.Ω));
