(function (Ω) {

	"use strict";

	var Beach = Ω.Class.extend({

		sheet: new Ω.SpriteSheet("res/images/tiles.png", 32, 32),

		init: function (width, length) {

			this.map = this.generateMap(width, length);

		},

		generateMap: function (width, length) {

			this.width = width;
			this.length = length;

			var cells = [];
			for (var j = 0; j < length; j++) {
				cells.push([]);
				for (var i = 0; i < width; i++) {
					cells[j][i] = Ω.utils.rand(4) + 1;
				}
			}

			return new Ω.Map(this.sheet, cells, 5);

		}

	});

	window.Beach = Beach;

}(window.Ω));
