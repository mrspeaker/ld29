(function (Ω) {

	"use strict";

	var Beach = Ω.Class.extend({

		sheet: new Ω.SpriteSheet("res/images/tiles.png", 32),

		hoverCell: null,

		init: function (width, length) {

			var map = this.generateMap(width, length);
			this.map = map.map;
			this.treasure = map.treasure;

			this.pos = {
                x: Ω.env.w / 2,
                y: 0
            };

		},

		search: function (player, removeIfFound) {
        	var blockPixPos = [player.x, player.y + 24];
        	var blockCellPos = this.map.getBlockCell(blockPixPos);
        	var blockType = this.map.getBlock(blockPixPos);
        	// Dodgy hack: if on first line == not searched
        	if (blockType < this.sheet.cellW) {
        		this.map.setBlock(blockPixPos, blockType + this.sheet.cellW);
        	}

			// Any treasure?
			let treasure = 0;
			if (blockCellPos[1] > -1) {
				console.log(blockCellPos[1] ,this.treasure.length);
        		treasure = this.treasure[blockCellPos[1]][blockCellPos[0]]
        		if (treasure && removeIfFound) {
        			this.treasure[blockCellPos[1]][blockCellPos[0]] = 0;
        		}
        	}
        	return treasure;
		},

		tick: function () { return true; },

		ticka: function (camera, player) {

			let targetBlock = this.map.getBlockCell([player.x, player.y + 24]);
			let targetPixels = this.map.getCellPixels(targetBlock);
			this.hoverCell = targetPixels;

			this.pos.x = player.x - (Ω.env.w / 2) + 24;
            this.pos.y = player.y - (Ω.env.h / 2);

			this.pos.x = Math.min(Math.max(0, this.pos.x), this.map.w - camera.w);
			this.pos.y = Math.min(Math.max(-80, this.pos.y), this.map.h - camera.h);

		},

		generateMap: function (width, length) {

			this.width = width;
			this.length = length;

			var cells = [],
				treasure = [];

			for (let j = 0; j < length; j++) {
				cells.push([]);
				treasure.push([]);
				for (let i = 0; i < width; i++) {
					treasure[j][i] = 0;
					if (j === 0) {
						cells[j][i] = Ω.utils.rand(5) + 41;
					}
					else {
						cells[j][i] = Ω.utils.rand(4) + 1;
						if (Ω.utils.oneIn(20)) {
							treasure[j][i] = Ω.utils.rand(3) + 1;
						}
					}
				}
			}

			return {
				map: new Ω.Map(this.sheet, cells, 5),
				treasure: treasure
			};

		},

		render: function (gfx) {

			var c = gfx.ctx;

			if (this.hoverCell) {
				c.strokeStyle = "rgba(0, 0, 0, 0.2)";
				c.strokeRect(this.hoverCell[0], this.hoverCell[1], this.sheet.w, this.sheet.h);
			}

		}

	});

	window.Beach = Beach;

}(window.Ω));
