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

		reset: function (level) {function ITER$0(v,f){var $Symbol_iterator=typeof Symbol!=='undefined'&&Symbol.iterator||'@@iterator';if(v){if(Array.isArray(v))return f?v.slice():v;var i,r;if(typeof v==='object'&&typeof (f=v[$Symbol_iterator])==='function'){i=f.call(v);r=[];while((f=i['next']()),f['done']!==true)r.push(f['value']);return r;}}throw new Error(v+' is not iterable')};

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
				[].concat(ITER$0(spawns.type("sb_man"), true), ITER$0(spawns.type("sb_lady"))),
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
			var map = (sheet = this).map, sheet = sheet.sheet,
				x = player.x, y = player.y, center = player.center,
				blockPixPos = [x + center.x, y + center.y],
				blockCellPos = map.getBlockCell(blockPixPos),
				blockType = map.getBlock(blockPixPos);

			// Dodgy hack: if on first line == not searched
			if (!removeIfFound && blockType < sheet.cellW) {
				this.toDig--;
				map.setBlock(blockPixPos, blockType + sheet.cellW);
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

			var map = (sheet = this).map, sheet = sheet.sheet,
				x = player.x, y = player.y, center = player.center,
				pos = [x + center.x, y + center.y];

			map.setBlock(pos, sheet.cellW + 6 + stage); // Ummmm... what is 6?

		},

		tick: function () {

			// Todo: this should be mainscreen
			var x = (center = this.player).x, y = center.y, center = center.center,
				pos = (env = this).pos, map = env.map, env = env.env;

			var midX = x - (env.w / 2) + center.y,
				midY = y - (env.h / 2);

			pos.x = Ω.math.clamp(midX, 0, map.w - env.w);
			pos.y = Ω.math.clamp(midY, -80, map.h - env.h);

			return true;

		},

		findPlayer: function (e) {

			var map = (player = this).map, graph = player.graph, player = player.player,
				w = (h = map.sheet).w, h = h.h,
				nodes = graph.nodes,
				from = nodes[e.y / w | 0][e.x / h | 0],
				to = nodes[player.y / w | 0][player.x / h | 0];

			// Recompute A*
			return Ω.Math.aStar.search(nodes, from, to);

		},

		generateMap: function (width, length) {

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
				cellW = map.cellW, cellH = map.cellH, cells = map.cells;

			// Create empty map
			var t = cells.map(function(r)  {return r.map(function(c)  {return 0})});

			// Add treasures
			while (toAdd) {
				var rx = Ω.utils.rand(cellW),
					ry = Ω.utils.rand(cellH),
					cell = cells[ry][rx];
				if (cell <= this.walkableSandCells) {
					// 1 to 3 bucks!
					t[ry][rx] = Ω.utils.rand(2) + 1;
					toAdd --;
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
