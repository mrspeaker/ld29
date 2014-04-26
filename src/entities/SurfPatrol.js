(function (Ω) {

	"use strict";

	var SurfPatrol = Ω.Entity.extend({
		w: 24,
		h: 32,

		speed: {
			patrol: 0.5,
			chase: 0.9
		},

		sheet: new Ω.SpriteSheet("res/images/walkers.png", 24, 32),

		state: null,

		init: function (x, y, player) {

			this._super(x, y);

			this.anims = new Ω.Anims([
				new Ω.Anim("walk", this.sheet, 120, [[0, 2], [1, 2]])
			]);

			this.state = new Ω.utils.State("BORN");

			this.player = player;

		},

		tick: function () {

			this.state.tick();
			switch (this.state.get()) {
			case "BORN":
				this.state.set("PATROL");
				break;
			case "PATROL":
				if (Ω.utils.oneIn(200)) {
					this.state.set("CHASE");
				}
				this.tick_PATROL();
				break;
			case "CHASE":
				if (Ω.utils.oneIn(200)) {
					this.state.set("PATROL");
				}
				this.tick_CHASE();
				break;
			}

			this.anims.tick();

			return true;

		},

		tick_PATROL: function () {

			switch (Ω.utils.now() / 2000 % 4 | 0) {
			case 0:
				this.x -= this.speed.patrol;
				break;
			case 2:
				this.x += this.speed.patrol;
				break;
			case 1:
				this.y -= this.speed.patrol;
				break;
			case 3:
				this.y += this.speed.patrol;
				break;
			}
		},

		tick_CHASE: function () {
			if (this.player.x < this.x) {
				this.x -= this.speed.chase;
			}
			if (this.player.x > this.x) {
				this.x += this.speed.chase;
			}
			if (this.player.y > this.y) {
				this.y += this.speed.chase;
			}
			if (this.player.y < this.y) {
				this.y -= this.speed.chase;
			}
		},

		render: function (gfx) {

			var c = gfx.ctx;

			this.anims.render(gfx, this.x, this.y);
	   }

	});

	window.SurfPatrol = SurfPatrol;

}(window.Ω));
