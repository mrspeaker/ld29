(function (Ω) {

	"use strict";

	var Beach = Ω.Class.extend({

		sheet: new Ω.SpriteSheet("res/images/tiles.png", 32, 32),

		drawing: false,
		target: null,
		path: null,
		pathStarted: false,

		init: function (width, length) {

			var map = this.generateMap(width, length);
			this.map = map.map;
			this.treasure = map.treasure;

			this.pos = {
                x: Ω.env.w / 2,
                y: 0
            };
			this.target = [100, 100];
			this.path = [];

		},

		search: function (pos, player) {
			this.pathStarted = true;
        	var blockPixPos = this.path[0];
        	var blockCellPos = this.map.getBlockCell(blockPixPos);
        	var blockType = this.map.getBlock(blockPixPos);
        	// Dodgy hack: if on first line == not searched
        	if (blockType  < this.sheet.cellW) {
        		this.map.setBlock(blockPixPos, blockType + this.sheet.cellW);
        	}


			this.path = this.path.slice(1);

			// Any treasure?
        	var treasure = this.treasure[blockCellPos[1]][blockCellPos[0]]
        	if (treasure) {
        		this.treasure[blockCellPos[1]][blockCellPos[0]] = 0;
        		console.log("found treauser");
        	}
        	return treasure;
		},

		tick: function () { return true; },

		ticka: function (camera) {

			// Mouse handling here.
			if (Ω.input.pressed("moused")) {
				this.drawing = true;
				this.path = [];
				this.pathStarted = false;
			}

			if (Ω.input.released("moused")) {
				this.drawing = false;
			}

			if (this.drawing) {
				this.target = [Math.max(0, camera.x + Ω.input.mouse.x - 30), Math.max(0, camera.y + Ω.input.mouse.y - 0)];
				this.targetBlock = this.map.getBlockCell(this.target);
				var targetPixels = this.map.getCellPixels(this.targetBlock);
				var last = this.path.length === 0 ? false : this.path[this.path.length - 1];
				if (!last || targetPixels[0] !== last[0] || targetPixels[1] !== last[1]) {
					this.path.push(targetPixels);
				}
			}

			var speed = this.drawing ? 2 : 4;

			if (Ω.input.isDown("left")) {
			    this.pos.x -= speed;
			} else if (Ω.input.isDown("right")) {
			    this.pos.x += speed;
			}
			if (Ω.input.isDown("up")) {
			    this.pos.y -= speed;
			} else if (Ω.input.isDown("down")) {
			    this.pos.y += speed;
			}

			this.pos.x = Math.min(Math.max(0, this.pos.x), this.map.w - camera.w);
			this.pos.y = Math.min(Math.max(-80, this.pos.y), this.map.h - camera.h);

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
					treasure[j][i] = 0;
					if (j === 0) {
						cells[j][i] = Ω.utils.rand(5) + 41;
					}
					else {
						cells[j][i] = Ω.utils.rand(4) + 1;
						if (Ω.utils.oneIn(5)) {
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

			c.fillStyle = "rgba(0, 0, 0, 0.2)";

			this.path.forEach(function (dot) {

				//c.fillRect(dot[0], dot[1], 10,10);
				c.beginPath();
				c.arc(dot[0] + 15, dot[1] + 15, 5, 0, Math.PI * 2, false);
				c.fill();

			});

		}

	});

	window.Beach = Beach;

}(window.Ω));
