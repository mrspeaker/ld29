(function (Ω) {

	"use strict";

	var SurfPatrol = Ω.Entity.extend({
		w: 24,
		h: 32,

		speed: {
			patrol: 1,
			move: 2.4
		},

		sheet: new Ω.SpriteSheet("res/images/walkers.png", 24, 32),

		state: null,

		init: function (x, y, player) {

			this._super(x, y);

			this.anims = new Ω.Anims([
				new Ω.Anim("walk", this.sheet, 120, [[0, 2], [1, 2]])
			]);

			this.player = player;

		},

		tick: function () {

			this.anims.tick();

			if (this.player.x < this.x) {
				this.x -= this.speed.patrol;
			}
			if (this.player.x > this.x) {
				this.x += this.speed.patrol;
			}
			if (this.player.y > this.y) {
				this.y += this.speed.patrol;
			}
			if (this.player.y < this.y) {
				this.y -= this.speed.patrol;
			}

			return true;

		},

		render: function (gfx) {

			var c = gfx.ctx;

			this.anims.render(gfx, this.x, this.y);
	   }

	});

	window.SurfPatrol = SurfPatrol;

}(window.Ω));
