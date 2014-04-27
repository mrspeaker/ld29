(function (Ω) {

    "use strict";

    var MainScreen = Ω.Screen.extend({

        font: new Ω.Font("res/images/mamefont.png", 16, 16, "abcdefghijklmnopqrstuvwxyz0123456789 .,:!?'\"&<>$"),

        state: null,
        autoTick: false,
        curTime: 0,

        cashcashmoney: 0,

        init: function () {

            this.reset();

        },

        reset: function () {

            this.removeAll();

            var env = {
                x:0,
                y:0,
                w:Ω.env.w,
                h:Ω.env.h - 100
            };

            this.beach = this.add(new window.Beach(40, 10, env));
            this.add(this.beach.map, "map", 1);
            this.player = this.add(new window.Player(Ω.env.w * 0.5, Ω.env.h * 0.2, this));
            this.camera = new Ω.Camera(0, 0, Ω.env.w, Ω.env.h - 100);

            this.beach.setPlayer(this.player);

            this.cop = this.add(new window.SurfPatrol(Ω.env.w, 10, this));

            this.state = new Ω.utils.State("BORN");

        },

        tick: function () {

            this.state.tick();

            switch (this.state.get()) {
            case "BORN":
                this.state.set("DAYBREAK");
                break;
            case "DAYBREAK":
                if (this.state.first()) {
                    this.tick_DAY();
                }
                if (this.state.count === 30) {
                    this.curTime = 0;
                    window.game.setDialog(new window.PopupDialog("day break!"));
                    this.state.set("DAY");
                }
                break;
            case "DAY":
                this.curTime++;
                if (this.curTime / 2000 > 8) {
                    // Day over.
                    this.state.set("SUNSET");
                } else {
                    this.tick_DAY();
                }
                break;
            case "SUNSET":
                if (this.state.first()) {
                    this.cashcashmoney += this.player.cash;
                    this.player.cash = 0;
                    window.game.setDialog(new window.PopupDialog("day is done."));

                }
                if (this.state.count > 10) {
                    this.state.set("DAYBREAK");
                    this.reset();
                }
                break;
            case "GAMEOVER":
                window.game.reset();
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
        },

        captured: function () {
            this.state.set("GAMEOVER");
        },

        render: function (gfx) {

            this.clear(gfx, "hsl(198, 68%, 52%)");

        },

        renderPost: function (gfx) {

            var c = gfx.ctx,
                top = Ω.env.h - 100;

            c.fillStyle = "hsl(200, 40%, 20%)";
            c.fillRect(0, top, Ω.env.w, 100);

            this.font.render(gfx, "cash: $" + (this.cashcashmoney + this.player.cash), 16, top + 16);
            this.font.render(gfx, "time: " + (this.curTime / 200 | 0), 16, top + 36);

        }

    });

    window.MainScreen = MainScreen;

}(window.Ω));
