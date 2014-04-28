(function (Ω) {

	"use strict";

	var SurfPatrol = Ω.Entity.extend({
		w: 24,
		h: 32,

		speed: {
			patrol: 0.5,
			chase: 1
		},

		sheet: new Ω.SpriteSheet("res/images/walkers.png", 24, 32),

		state: null,

		init: function (x, y, screen) {

			this._super(x, y);

			this.anims = new Ω.Anims([
				new Ω.Anim("walk", this.sheet, 120, [[0, 2], [1, 2]])
			]);

			this.state = new Ω.utils.State("BORN");

			this.player = screen.player;
			this.beach = screen.beach;

			this.findPlayer();
		},

		reset: function () {
			this.state.set("BORN");
		},

		findPlayer: function () {
			this.path = this.beach.findPlayer(this);
		},

		tick: function () {

			this.state.tick();
			switch (this.state.get()) {
			case "BORN":
				this.state.set("CHASE");
				break;
			case "PATROL":
				if (Ω.utils.oneIn(200)) {
					this.state.set("CHASE");
				}
				this.tick_PATROL();
				break;
			case "CHASE":
				if (Ω.utils.oneIn(200)) {
					//this.state.set("PATROL");
				}
				if (this.state.count % 5 === 0) {
					this.findPlayer();
				}
				this.tick_CHASE();
				break;
			}

			this.anims.tick();

			return true;

		},

		tick_PATROL: function () {

			var xo = 0,
				yo = 0;

			switch (Ω.utils.now() / 2000 % 4 | 0) {
			case 0:
				xo -= this.speed.patrol;
				break;
			case 2:
				xo += this.speed.patrol;
				break;
			case 1:
				yo -= this.speed.patrol;
				break;
			case 3:
				yo += this.speed.patrol;
				break;
			}

			this.move(xo, yo, this.beach.map);
		},

		tick_CHASE: function () {
			var xo = 0,
				yo = 0,
				w = this.beach.map.sheet.w;

			if (this.player.state.is("DEHYDRATED")) {
				return;
			}

			// Move along the a* path
			if (this.path.length) {
				if (this.y < this.path[0].x * w) {
					yo += this.speed.chase;
				}
				if (this.y > this.path[0].x * w) {
					yo -= this.speed.chase;
				}
				if (this.x < this.path[0].y * w) {
					xo += this.speed.chase;
				}
				if (this.x > this.path[0].y * w) {
					xo -= this.speed.chase;
				}
			}

			this.move(xo, yo, this.beach.map);
		},

		render: function (gfx) {

			var c = gfx.ctx;

			this.anims.render(gfx, this.x, this.y);
	   }

	});

	window.SurfPatrol = SurfPatrol;

}(window.Ω));
