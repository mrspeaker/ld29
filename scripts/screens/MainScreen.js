(function (Ω) {

    "use strict";

    var MainScreen = Ω.Screen.extend({

        font: new Ω.Font("res/images/mamefont.png", 16, 16, "abcdefghijklmnopqrstuvwxyz0123456789 .,:!?'\"&<>$"),

        init: function () {

            this.beach = this.add(new window.Beach(40, 10));
            this.add(this.beach.map, "map", 1);
            this.player = this.add(new window.Player(Ω.env.w * 0.5, Ω.env.h * 0.2, this));
            this.camera = new Ω.Camera(0, 0, Ω.env.w, Ω.env.h - 100);

            (function(){function GET_ITER$0(v){if(v){if(Array.isArray(v))return 0;if(typeof v==='object'&&typeof v['@@iterator']==='function')return v['@@iterator']();}throw new Error(v+' is not iterable')};var $D$0;var $D$1;var $D$2;var $D$3;var $result$0 = [], x;$D$3 = ([1,2,3,4,5]);$D$0 = GET_ITER$0($D$3);$D$2 = $D$0 === 0;$D$1 = ($D$2 ? $D$3.length : void 0);for(; $D$2 ? ($D$0 < $D$1) : !($D$1 = $D$0["next"]())["done"]; ){x = ($D$2 ? $D$3[$D$0++] : $D$1["value"]);{$result$0.push(this.add(new window.BeachBum(
                Ω.math.snap(Ω.utils.rand(Ω.env.w), 32),
                Ω.math.snap(Ω.utils.rand(Ω.env.h - 96), 32) + 32,
                Ω.utils.rand(2)
            ), "extras", 2))}};;return $result$0}).call(this);

            this.cop = this.add(new window.SurfPatrol(Ω.env.w, 10, this.player));

        },

        tick: function () {

            this.beach.ticka(this.camera);

            this.camera.moveTo(
                this.beach.pos.x,
                this.beach.pos.y
            );

            if (this.cop.state.is("CHASE")) {
                Ω.Physics.checkCollision(this.player, [this.cop]);
            }

        },

        captured: function () {
            window.game.reset();
        },

        render: function (gfx) {

            this.clear(gfx, "hsl(198, 68%, 52%)");

        },

        renderPost: function (gfx) {

            var c = gfx.ctx,
                top = Ω.env.h - 100;

            c.fillStyle = "hsl(200, 40%, 20%)";
            c.fillRect(0, top, Ω.env.w, 100);

            this.font.render(gfx, "cash: $" + this.player.cash, 16, top + 16);

        }

    });

    window.MainScreen = MainScreen;

}(window.Ω));
