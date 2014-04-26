(function (Ω) {

	"use strict";

	var BeachBum = Ω.Entity.extend({
		w: 32,
		h: 64,

		sheet: new Ω.SpriteSheet("res/images/extras.png", 32, 32),

		init: function (x, y, type) {

			this._super(x, y);
			this.type = type;

		},

		render: function (gfx) {

			var c = gfx.ctx,
				t = this.type

			this.sheet.render(gfx, t, 0, this.x, this.y);
			this.sheet.render(gfx, t, 1, this.x, this.y + 32);

	   }

	});

	window.BeachBum = BeachBum;

}(window.Ω));
