(function (Ω) {

	"use strict";

	var Beach = Ω.Entity.extend({

		sheet: new Ω.SpriteSheet("res/images/tiles.png", 32),

		walkableSandCells: null,

		curLevel: null,
		loaded: false,

		init: function (levelIdx, env, cb) {

			this.load(`level${levelIdx}.json`, cb);

			this.walkableSandCells = this.sheet.cellW * 2;
			this.env = env;

		},

		load: function (name, cb) {

			this.loaded = false;

			new Ω.Tiled("res/levels/" + name + "?" + Date.now(), (level) => {

				console.log(level);

				this.level = level;

				this.reset(level, level.w, level.h);
				this.loaded = true;

				cb && cb();

			});

		},

		reset: function (level, w, h) {

			if (this.sunbathers) {
				this.sunbathers.forEach((sb) => {
					sb.remove = true;
				});
			}

			let spawns = level.layer("spawns");

			this.playerSpawn = spawns.name("player_spawn");
			this.copSpawn = spawns.name("cop_spawn");

			let sb = spawns.type("sb_man").concat(
				spawns.type("sb_lady")
			);

			let beer_spawns = spawns.type("beer_stand");

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
			var cells = this.map.cells.map((r) => {
				// Map the level grid to 1's and 0's
				return r.map((c) => {
					var cell = c > this.map.walkable ? 1 : 0
					if (cell === 0) {
						this.toDig++;
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
			let blockPixPos = [player.x + player.center.x, player.y + player.center.y];

			this.map.setBlock(blockPixPos, this.sheet.cellW + 6 + stage);
		},

		tick: function () {

			let player = this.player;

			this.pos.x = player.x - (Ω.env.w / 2) + player.center.y;
			this.pos.y = player.y - (Ω.env.h / 2);

			this.pos.x = Math.min(Math.max(0, this.pos.x), this.map.w - this.env.w);
			this.pos.y = Math.min(Math.max(-80, this.pos.y), this.map.h - this.env.h);

			return true;

		},

		findPlayer: function (e) {

			let w = this.map.sheet.w;
			let h = this.map.sheet.h;

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

		generateBeachPeeps: function (sbs, beerSpawns) {

			let cells = this.map.cells;

			let x = this.map.cellW / 2 - 1 | 0;
			let y = this.map.cellH / 2 - 1 | 0;

			this.stands = beerSpawns.map((stand) => {
				return this.add(new window.BeerStand(stand.x, stand.y));
			});

			this.sunbathers = [];

			sbs.forEach((sb) => {
				let xo = sb.x;
				let yo = sb.y;
				let type = sb.type === "sb_lady" ? 0 : 1;

				let sunbather = this.add(
					new window.BeachBum(
						xo,
						yo,
						type
					), "extras", 2);
				this.sunbathers.push(sunbather);

				var cell = this.map.getBlockCell([sunbather.x, sunbather.y]);
				cells[cell[1]][cell[0]] = this.walkableSandCells + this.sheet.cellW + 1;
				cells[cell[1] + 1][cell[0]] = this.walkableSandCells + this.sheet.cellW + 1;

			});

		},

		render: function (gfx) {}

	});

	window.Beach = Beach;

}(window.Ω));
