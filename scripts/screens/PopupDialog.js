(function (Ω) {

	"use strict";

	var PopupDialog = Ω.Dialog.extend({

		init: function (msg, key, cb) {

			this._super(key, cb);

			this.msg = msg;

		},

		tick: function (delta) {

			this.time += delta;

			if (this.time > 1.5 || (this.killKey && Ω.input.pressed(this.killKey))) {
				Ω.input.release(this.killKey);
				this.done();
			}

		},

		render: function (gfx) {

			var c = gfx.ctx;

			c.fillStyle = "hsl(0, 60%, 60%)";
			c.strokeStyle = "#fff";
			c.fillRect(gfx.w * 0.15, gfx.h * 0.25, gfx.w * 0.7, gfx.h * 0.5);
			c.strokeRect(gfx.w * 0.15, gfx.h * 0.25, gfx.w * 0.7, gfx.h * 0.5);

			c.fillStyle = "#fff";
			c.fillText(this.msg, gfx.w * 0.3, gfx.h * 0.5);

		}

	});

	window.PopupDialog = PopupDialog;

}(window.Ω));
