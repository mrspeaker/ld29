(function (Ω) {

	"use strict";

	var BeerStand = Ω.Entity.extend({

		w: 64,
		h: 64,

		sheet: new Ω.SpriteSheet("res/images/walkers.png", 24, 32),

		init: function (x, y) {

			this._super(x, y);

		},

		render: function (gfx) {

			var c = gfx.ctx;

			this.sheet.render(gfx, 2 + Ω.utils.toggle(500, 2), 2, this.x + 20, this.y + 3);

	   }

	});

	window.BeerStand = BeerStand;

}(window.Ω));
