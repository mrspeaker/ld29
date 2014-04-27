(function (Ω) {

	"use strict";

	var PopupDialog = Ω.Dialog.extend({

		font: new Ω.Font("res/images/mamefont.png", 16, 16, "abcdefghijklmnopqrstuvwxyz0123456789 .,:!?'\"&<>$"),

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

			c.fillStyle = Ω.utils.colors.get(13);
			c.strokeStyle = "#fff";
			c.fillRect(gfx.w * 0.25, gfx.h * 0.3, gfx.w * 0.5, gfx.h * 0.4);
			c.strokeRect(gfx.w * 0.25, gfx.h * 0.3, gfx.w * 0.5, gfx.h * 0.4);

			this.font.render(gfx, this.msg, gfx.w * 0.3, gfx.h * 0.5);

		}

	});

	window.PopupDialog = PopupDialog;

}(window.Ω));
