(function (Ω) {

	"use strict";

	var Beach = Ω.Entity.extend({

		sheet: new Ω.SpriteSheet("res/images/tiles.png", 32),

		walkableSandCells: null,
		loaded: false,

		init: function (levelIdx, env, cb) {

			this.load((("level" + levelIdx) + ".json"), cb);

			this.walkableSandCells = this.sheet.cellW * 2;
			this.env = env;

		},

		load: function (name, cb) {var this$0 = this;

			this.loaded = false;

			new Ω.Tiled((("res/levels/" + name) + ("?" + (Date.now())) + ""), function(level, err)  {

				if (err) {
					console.log("Error loading beach:", err);
					return;
				}

				this$0.level = level;
				this$0.reset(level);
				this$0.loaded = true;

				cb && cb();

			});

		},

		reset: function (level) {

			if (this.sunbathers) {
				this.sunbathers.forEach(function(sb)  {
					sb.remove = true;
				});
			}

			var w = level.w, h = level.h;

			// 1. Get beach, make map
			var map = this.map = this.generateMap(w, h);
			this.w = map.w;
			this.h = map.h;
			var beach = level.layer("beach");
			map.cells = beach.get().data;

			// 2. Add sunbathers/beer stand
			var spawns = level.layer("spawns");
			this.copSpawn = spawns.name("cop_spawn");
			this.playerSpawn = spawns.name("player_spawn");
			this.generateBeachPeeps(
				spawns.type("sb_man").concat(spawns.type("sb_lady")),
				spawns.type("beer_stand")
			);

			// 3. Add treasure
			var numTreasures = (treasureMap = this.generateTreasures(level, map))[0], treasureMap = treasureMap[1];
			this.treasure = treasureMap;
			this.numTreasures = numTreasures;

			// 4. Figure out a*
			var toDig = (graph = this.generateAStar(map))[0], graph = graph[1];
			this.toDig = toDig;
			this.graph = graph;

			// Todo - this should be the mainscreen.
			this.pos = {
				x: Ω.env.w / 2,
				y: 0
			};

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
				treasure = this.treasure[blockCellPos[1]][blockCellPos[0]];
				if (treasure && removeIfFound) {
					this.treasure[blockCellPos[1]][blockCellPos[0]] = 0;
				}
			}
			return treasure;
		},

		dig: function (player, stage) {
			var blockPixPos = [player.x + player.center.x, player.y + player.center.y];

			this.map.setBlock(blockPixPos, this.sheet.cellW + 6 + stage); // Ummmm... what is 6?
		},

		tick: function () {

			// Todo: this should be mainscreen

			var player = this.player;

			this.pos.x = player.x - (Ω.env.w / 2) + player.center.y;
			this.pos.y = player.y - (Ω.env.h / 2);

			this.pos.x = Ω.math.clamp(this.pos.x, 0, this.map.w - this.env.w);
			this.pos.y = Ω.math.clamp(this.pos.y, -80, this.map.h - this.env.h);

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

			var cells = [];

			for (var j = 0; j < length; j++) {
				cells.push([]);
				for (var i = 0; i < width; i++) {
					if (j === 0) {
						// Water level
						cells[j][i] = Ω.utils.rand(5) + 41;
					}
					else {
						// Sand tiles
						cells[j][i] = Ω.utils.rand(4) + 1;
					}
				}
			}

			return new Ω.Map(this.sheet, cells, this.walkableSandCells);
		},

		generateBeachPeeps: function (sbs, beerSpawns) {var this$0 = this;

			var cells = this.map.cells;

			this.stands = beerSpawns.map(function(s)  {return this$0.add(new window.BeerStand(s.x, s.y))});

			this.sunbathers = [];

			sbs.forEach(function(sb)  {
				var x = sb.x, y = sb.y, type = sb.type;

				var sunbather = this$0.add(
					new window.BeachBum(
						x,
						y,
						Ω.utils.rand(2)
					), "extras", 2);

				this$0.sunbathers.push(sunbather);

				// Unwalkableize the beach where sunbathers are
				var noWalk = this$0.walkableSandCells + this$0.sheet.cellW + 1;
				var c = (r = this$0.map.getBlockCell([x, y]))[0], r = r[1];

				cells[r][c] = noWalk;
				cells[r + 1][c] = noWalk;
			});

		},

		generateTreasures: function (level, map) {
			var numTreasures = level.properties.num_treasures,
				toAdd = numTreasures,
				cellW = map.cellW, cellH = map.cellH;

			var t = map.cells.map(function(r)  {return r.map(function(c)  {return 0})});

			while (toAdd) {
				var rx = Ω.utils.rand(cellW),
					ry = Ω.utils.rand(cellH),
					cell = map.cells[ry][rx];
				if (cell <= this.walkableSandCells) {
					console.log("ree!", rx, ry);
					toAdd --;
					t[ry][rx] = 1;
				}
			}

			return [numTreasures, t];
		},

		generateAStar: function (map) {

			var toDig = 0;

			// Do some A* path findin': convert map to 1 == walkable
			var cells = map.cells.map(function(r)  {
				// Map the level grid to 1's and 0's
				return r.map(function(c)  {
					var cell = c > map.walkable ? 1 : 0;
					if (cell === 0) {
						toDig++;
					}
					return cell;
				});
			});

			return [toDig, new Ω.Math.aStar.Graph(cells)];
		},

		render: function () {}

	});

	window.Beach = Beach;

}(window.Ω));
