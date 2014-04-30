(function (Ω) {

	"use strict";

	var Beach = Ω.Entity.extend({

		sheet: new Ω.SpriteSheet("res/images/tiles.png", 32),

		walkableSandCells: null,

		curLevel: null,
		loaded: false,

		init: function (levelIdx, env, cb) {

			this.load((("level" + levelIdx) + ".json"), cb);

			this.walkableSandCells = this.sheet.cellW * 2;
			this.env = env;

		},

		load: function (name, cb) {var this$0 = this;

			this.loaded = false;

			new Ω.Tiled("res/levels/" + name + "?" + Date.now(), function(level)  {

				console.log(level);

				this$0.level = level;

				this$0.reset(level, level.w, level.h);
				this$0.loaded = true;

				cb && cb();

			});

		},

		reset: function (level, w, h) {var this$0 = this;

			if (this.sunbathers) {
				this.sunbathers.forEach(function(sb)  {
					sb.remove = true;
				});
			}

			var spawns = level.layer("spawns");

			this.playerSpawn = spawns.name("player_spawn");
			this.copSpawn = spawns.name("cop_spawn");

			var sb = spawns.type("sb_man").concat(
				spawns.type("sb_lady")
			);

			var beer_spawns = spawns.type("beer_stand");

			var map = this.generateMap(w, h);
			this.map = map.map;
			this.map.cells = level.layers[0].data;

			this.treasure = map.treasure;
			this.w = this.map.w;
			this.h = this.map.h;

			this.generateBeachPeeps(sb, beer_spawns);

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

			this.map.setBlock(blockPixPos, this.sheet.cellW + 6 + stage);
		},

		tick: function () {

			var player = this.player;

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

		generateBeachPeeps: function (sbs, beerSpawns) {var this$0 = this;

			var cells = this.map.cells;

			var x = this.map.cellW / 2 - 1 | 0;
			var y = this.map.cellH / 2 - 1 | 0;

			this.stands = beerSpawns.map(function(stand)  {
				return this$0.add(new window.BeerStand(stand.x, stand.y));
			});

			this.sunbathers = [];

			sbs.forEach(function(sb)  {
				var xo = sb.x;
				var yo = sb.y;
				var type = sb.type === "sb_lady" ? 0 : 1;

				var sunbather = this$0.add(
					new window.BeachBum(
						xo,
						yo,
						type
					), "extras", 2);
				this$0.sunbathers.push(sunbather);

				var cell = this$0.map.getBlockCell([sunbather.x, sunbather.y]);
				cells[cell[1]][cell[0]] = this$0.walkableSandCells + this$0.sheet.cellW + 1;
				cells[cell[1] + 1][cell[0]] = this$0.walkableSandCells + this$0.sheet.cellW + 1;

			});

		},

		render: function (gfx) {}

	});

	window.Beach = Beach;

}(window.Ω));
