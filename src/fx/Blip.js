(function (Ω) {

	"use strict";

	var Blip = Ω.Class.extend({

        init: function (x, y) {

            this.max = 30;
            this.time = this.max;

            this.x = x;
            this.y = y;

        },

        tick: function () {
            this.ratio = 1 - (this.time / this.max);
            this.y -= 1;

            return this.time--;

        },

        render: function (gfx) {

            var c = gfx.ctx;

            c.fillStyle = `rgba(0, 0, 0, ${ 1 - this.ratio })`;
            c.fillText("blip", this.x, this.y | 0);

        }

    });

    window.Blip = Blip;

}(Ω));
