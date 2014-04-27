(function (Ω) {

	"use strict";

	var Beach = Ω.Entity.extend({

		sheet: new Ω.SpriteSheet("res/images/tiles.png", 32),

		hoverCell: null,
		walkableSandCells: null,

		init: function (width, length, env) {

			this.walkableSandCells = this.sheet.cellW * 2;

			this.env = env;

			this.reset(width, length);

		},

		reset: function (w, h) {var this$0 = this;

			if (this.sunbathers) {
				this.sunbathers.forEach(function(sb)  {
					sb.remove = true;
				});
			}

			var map = this.generateMap(w, h);
			this.map = map.map;
			this.treasure = map.treasure;
			this.w = this.map.w;
			this.h = this.map.h;

			this.generateBeachPeeps();

			this.pos = {
				x: Ω.env.w / 2,
				y: 0
			};

			this.toDig = 0;
			// Do some A* path findin'
			var cells = this.map.cells.map(function(r)  {
				// Map the level grid to 1's and 0's
				return r.map(function(c)  {
					var cell = c > this$0.map.walkable ? 1 : 0
					if (cell === 0) {
						this$0.toDig++;
					}
					return cell;
				});
			});

			this.graph = new Ω.Math.aStar.Graph(cells);


		},

		setPlayer: function (player) {
			this.player = player;
		},

		search: function (player, removeIfFound) {
			var blockPixPos = [player.x + player.center.x, player.y + player.center.y];
			var blockCellPos = this.map.getBlockCell(blockPixPos);
			var blockType = this.map.getBlock(blockPixPos);
			// Dodgy hack: if on first line == not searched

			if (!removeIfFound && blockType < this.sheet.cellW) {
				this.toDig--;
				this.map.setBlock(blockPixPos, blockType + this.sheet.cellW);
			}

			// Any treasure?
			var treasure = 0;
			if (blockCellPos[1] > -1) {
				treasure = this.treasure[blockCellPos[1]][blockCellPos[0]]
				if (treasure && removeIfFound) {
					this.treasure[blockCellPos[1]][blockCellPos[0]] = 0;
				}
			}
			return treasure;
		},

		dig: function (player, stage) {
			var blockPixPos = [player.x + player.center.x, player.y + player.center.y];
			//var blockCellPos = this.map.getBlockCell(blockPixPos);
			//var blockType = this.map.getBlock(blockPixPos);
			// Dodgy hack: if on first line == not searched
			//if (blockType < this.sheet.cellW) {
			this.map.setBlock(blockPixPos, this.sheet.cellW + 6 + stage);
			//}

		},

		//tick: function () { return true; },

		tick: function () {

			var player = this.player;

			var targetBlock = this.map.getBlockCell([player.x + player.center.x, player.y + player.center.y]);
			var targetPixels = this.map.getCellPixels(targetBlock);
			this.hoverCell = targetPixels;

			this.pos.x = player.x - (Ω.env.w / 2) + player.center.y;
			this.pos.y = player.y - (Ω.env.h / 2);

			this.pos.x = Math.min(Math.max(0, this.pos.x), this.map.w - this.env.w);
			this.pos.y = Math.min(Math.max(-80, this.pos.y), this.map.h - this.env.h);

			return true;

		},

		findPlayer: function (e) {

			var w = this.map.sheet.w;
			var h = this.map.sheet.h;

			// Recompute A*
			return Ω.Math.aStar.search(
				this.graph.nodes,
				this.graph.nodes[e.y / w | 0][e.x / h | 0],
				this.graph.nodes[this.player.y / w | 0][this.player.x / h | 0]
			);

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

		generateBeachPeeps: function () {var this$0 = this;

			var cells = this.map.cells;

			this.sunbathers = (function(){function GET_ITER$0(v){if(v){if(Array.isArray(v))return 0;if(typeof v==='object'&&typeof v['@@iterator']==='function')return v['@@iterator']();}throw new Error(v+' is not iterable')};var $D$0;var $D$1;var $D$2;var $D$3;var $result$0 = [], x;$D$3 = ([1,2,3,4,5,6,7,8,9]);$D$0 = GET_ITER$0($D$3);$D$2 = $D$0 === 0;$D$1 = ($D$2 ? $D$3.length : void 0);for(; $D$2 ? ($D$0 < $D$1) : !($D$1 = $D$0["next"]())["done"]; ){x = ($D$2 ? $D$3[$D$0++] : $D$1["value"]);{$result$0.push(this.add(new window.BeachBum(
				Ω.math.snap(Ω.utils.rand(this.w), 32),
				Ω.math.snap(Ω.utils.rand(this.h - 96), 32) + 32,
				Ω.utils.rand(2)
			), "extras", 2))}};;return $result$0}).call(this);

			this.sunbathers.forEach(function(b)  {
				var cell = this$0.map.getBlockCell([b.x, b.y]);
				cells[cell[1]][cell[0]] = this$0.walkableSandCells + this$0.sheet.cellW + 1;
				cells[cell[1] + 1][cell[0]] = this$0.walkableSandCells + this$0.sheet.cellW + 1;
			});

			var x = this.map.cellW / 2 - 1 | 0;
			var y = this.map.cellH / 2 - 1 | 0;
			cells[y][x] = 2 * this.sheet.cellW + 8;
			cells[y][x + 1] = 2 * this.sheet.cellW + 9;
			cells[y + 1][x] = 3 * this.sheet.cellW + 8;
			cells[y + 1][x + 1] = 3 * this.sheet.cellW + 9;

			this.stand = this.add(new window.BeerStand(x * this.sheet.w, y * this.sheet.h));

		},

		render: function (gfx) {

			var c = gfx.ctx;

			/*if (this.hoverCell) {
				c.strokeStyle = "rgba(0, 0, 0, 0.2)";
				c.strokeRect(this.hoverCell[0], this.hoverCell[1], this.sheet.w, this.sheet.h);
			}*/

		}

	});

	window.Beach = Beach;

}(window.Ω));
