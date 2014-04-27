(function (Ω) {

	"use strict";

	var Umbrella = Ω.Entity.extend({
		w: 64,
		h: 64,

		sheet: new Ω.SpriteSheet("res/images/extras.png", 32, 32),

		init: function (x, y, type) {

			this._super(x, y);
			this.type = type;

		},

		render: function (gfx) {

			var c = gfx.ctx,
				t = this.type

			this.sheet.render(gfx, 2, 0, this.x, this.y);
			this.sheet.render(gfx, 3, 0, this.x + 32, this.y);
			this.sheet.render(gfx, 2, 1, this.x, this.y + 32);
			this.sheet.render(gfx, 3, 1, this.x + 32, this.y + 32);

	   }

	});

	window.Umbrella = Umbrella;

}(window.Ω));
