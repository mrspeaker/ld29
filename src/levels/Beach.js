(function (Ω) {

	"use strict";

	var Beach = Ω.Class.extend({

		sheet: new Ω.SpriteSheet("res/images/tiles.png", 32, 32),

		drawing: false,

		init: function (width, length) {

			var map = this.generateMap(width, length);
			this.map = map.map;
			this.treasure = map.treasure;

			this.pos = {
                x: Ω.env.w / 2,
                y: Ω.env.h / 2
            };
			this.target = [100, 100];

		},

		tick: function (camera) {

			// Mouse handling here.
			if (Ω.input.pressed("moused")) {
				this.drawing = true;
				this.target = [Math.max(0, camera.x + Ω.input.mouse.x), Math.max(0, camera.y + Ω.input.mouse.y)];
				console.log(this.map.getBlock([Ω.input.mouse.x, Ω.input.mouse.y]));//, camera);
			}

			if (Ω.input.released("moused")) {
				this.drawing = false;
			}

			var speed = this.drawing ? 2 : 4;

			if (Ω.input.mouse.x < Ω.env.w * 0.20) {
			    this.pos.x -= speed;
			} else if (Ω.input.mouse.x > Ω.env.w * 0.80) {
			    this.pos.x += speed;
			}
			if (Ω.input.mouse.y < Ω.env.h * 0.20) {
			    this.pos.y -= speed;
			} else if (Ω.input.mouse.y > Ω.env.h * 0.80) {
			    this.pos.y += speed;
			}


		},

		generateMap: function (width, length) {

			this.width = width;
			this.length = length;

			var cells = [],
				treasure = [];
			for (var j = 0; j < length; j++) {
				cells.push([]);
				treasure.push([]);
				for (var i = 0; i < width; i++) {
					cells[j][i] = Ω.utils.rand(4) + 1;
					treasure[j][i] = 0;
					if (Ω.utils.oneIn(20)) {
						treasure[j][i] = Ω.utils.rand(3);
					}
				}
			}

			return {
				map: new Ω.Map(this.sheet, cells, 5),
				treasure: treasure
			};

		}

	});

	window.Beach = Beach;

}(window.Ω));
