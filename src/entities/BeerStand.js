(function (Ω) {

	"use strict";

	var BeerStand = Ω.Entity.extend({

		w: 64,
		h: 64,

		sheet: new Ω.SpriteSheet("res/images/extras.png", 32, 32),

		init: function (x, y) {

			this._super(x, y);

		},

		render: function (gfx) {

			var c = gfx.ctx;

			this.sheet.render(gfx, 0, 0, this.x, this.y);
			//this.sheet.render(gfx, t, 1, this.x, this.y + 32);

	   }

	});

	window.BeerStand = BeerStand;

}(window.Ω));
