(function (Ω) {

	"use strict";

	var Beach = Ω.Class.extend({

		sheet: new Ω.SpriteSheet("res/images/tiles.png", 32, 32),

		init: function (width, length) {

			var map = this.generateMap(width, length);
			this.map = map.map;
			this.treasure = map.treasure;

			this.target = [100, 100];

		},

		tick: function (camera) {

			// Mouse handling here.
			if (Ω.input.pressed("moused")) {
				this.target = [Ω.input.mouse.x - camera.x, Ω.input.mouse.y - camera.y];
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
