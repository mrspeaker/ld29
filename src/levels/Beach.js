(function (Ω) {

	"use strict";

	var Beach = Ω.Entity.extend({

		sheet: new Ω.SpriteSheet("res/images/tiles.png", 32),

		hoverCell: null,
		walkableSandCells: null,

		init: function (width, length, env) {

			this.walkableSandCells = this.sheet.cellW * 2;

			var map = this.generateMap(width, length);
			this.map = map.map;
			this.treasure = map.treasure;

			this.w = this.map.w;
			this.h = this.map.h;

			this.pos = {
                x: Ω.env.w / 2,
                y: 0
            };

            var bb = [this.add(new window.BeachBum(
                Ω.math.snap(Ω.utils.rand(this.w), 32),
                Ω.math.snap(Ω.utils.rand(this.h - 96), 32) + 32,
                Ω.utils.rand(2)
            ), "extras", 2) for (x of [1,2,3,4,5,6,7,8,9])];

            bb.forEach((b) => {
            	var cell = this.map.getBlockCell([b.x, b.y]);
            	this.map.cells[cell[1]][cell[0]] = this.walkableSandCells + this.sheet.cellW + 1;
            	this.map.cells[cell[1] + 1][cell[0]] = this.walkableSandCells + this.sheet.cellW + 1;
            });

            this.env = env;

		},

		setPlayer: function (player) {
			this.player = player;
		},

		search: function (player, removeIfFound) {
        	var blockPixPos = [player.x, player.y + 24];
        	var blockCellPos = this.map.getBlockCell(blockPixPos);
        	var blockType = this.map.getBlock(blockPixPos);
        	// Dodgy hack: if on first line == not searched
        	if (!removeIfFound && blockType < this.sheet.cellW) {
        		this.map.setBlock(blockPixPos, blockType + this.sheet.cellW);
        	}

			// Any treasure?
			let treasure = 0;
			if (blockCellPos[1] > -1) {
        		treasure = this.treasure[blockCellPos[1]][blockCellPos[0]]
        		if (treasure && removeIfFound) {
        			this.treasure[blockCellPos[1]][blockCellPos[0]] = 0;
        		}
        	}
        	return treasure;
		},

		dig: function (player, stage) {
			var blockPixPos = [player.x, player.y + 24];
			//var blockCellPos = this.map.getBlockCell(blockPixPos);
			//var blockType = this.map.getBlock(blockPixPos);
			// Dodgy hack: if on first line == not searched
			//if (blockType < this.sheet.cellW) {
				this.map.setBlock(blockPixPos, this.sheet.cellW + 6 + stage);
			//}

		},

		//tick: function () { return true; },

		tick: function () {

			let player = this.player;

			let targetBlock = this.map.getBlockCell([player.x, player.y + 24]);
			let targetPixels = this.map.getCellPixels(targetBlock);
			this.hoverCell = targetPixels;

			this.pos.x = player.x - (Ω.env.w / 2) + 24;
            this.pos.y = player.y - (Ω.env.h / 2);

			this.pos.x = Math.min(Math.max(0, this.pos.x), this.map.w - this.env.w);
			this.pos.y = Math.min(Math.max(-80, this.pos.y), this.map.h - this.env.h);

			return true;

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
				map: new Ω.Map(this.sheet, cells, this.walkableSandCells),
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
