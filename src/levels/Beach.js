(function (Ω) {

	"use strict";

	var Beach = Ω.Entity.extend({

		sheet: new Ω.SpriteSheet("res/images/tiles.png", 32),

		walkableSandCells: null,
		loaded: false,

		init (levelIdx, env, cb) {

			this.load(`level${ levelIdx }.json`, cb);

			this.walkableSandCells = this.sheet.cellW * 2;
			this.env = env;

		},

		load (name, cb) {

			this.loaded = false;

			new Ω.Tiled(`res/levels/${ name }?${ Date.now() }`, (level, err) => {

				if (err) {
					console.log("Error loading beach:", err);
					return;
				}

				this.level = level;
				this.reset(level);
				this.loaded = true;

				cb && cb();

			});

		},

		reset (level) {

			if (this.sunbathers) {
				this.sunbathers.forEach((sb) => {
					sb.remove = true;
				});
			}

			let {w, h} = level;

			// 1. Get beach, make map
			let map = this.map = this.generateMap(w, h);
			this.w = map.w;
			this.h = map.h;
			let beach = level.layer("beach");
			map.cells = beach.get().data;

			// 2. Add sunbathers/beer stand
			let spawns = level.layer("spawns");
			this.copSpawn = spawns.name("cop_spawn");
			this.playerSpawn = spawns.name("player_spawn");
			this.generateBeachPeeps(
				[...spawns.type("sb_man"), ...spawns.type("sb_lady")],
				spawns.type("beer_stand")
			);

			// 3. Add treasure
			let [numTreasures, treasureMap] = this.generateTreasures(level, map);
			this.treasure = treasureMap;
			this.numTreasures = numTreasures;

			// 4. Figure out a*
			let [toDig, graph] = this.generateAStar(map);
			this.toDig = toDig;
			this.graph = graph;

			// Todo - this should be the mainscreen.
			this.pos = {
				x: Ω.env.w / 2,
				y: 0
			};

		},

		setPlayer (player) {
			this.player = player;
		},

		search (player, removeIfFound) {
			let {map, sheet} = this,
				{x, y, center} = player,
				blockPixPos = [x + center.x, y + center.y],
				blockCellPos = map.getBlockCell(blockPixPos),
				blockType = map.getBlock(blockPixPos);

			// Dodgy hack: if on first line == not searched
			if (!removeIfFound && blockType < sheet.cellW) {
				this.toDig--;
				map.setBlock(blockPixPos, blockType + sheet.cellW);
			}

			// Any treasure?
			let treasure = 0;
			if (blockCellPos[1] > -1) {
				treasure = this.treasure[blockCellPos[1]][blockCellPos[0]];
				if (treasure && removeIfFound) {
					this.treasure[blockCellPos[1]][blockCellPos[0]] = 0;
				}
			}
			return treasure;
		},

		dig (player, stage) {

			let {map, sheet} = this,
				tileOffset = sheet.cellW + 6;

			map.setBlock(player.getCenter(), tileOffset + stage);

		},

		digged (player) {

		},

		tick () {

			// Todo: this should be mainscreen
			let {x, y, center} = this.player,
				{pos, map, env} = this;

			let midX = x - (env.w / 2) + center.y,
				midY = y - (env.h / 2);

			pos.x = Ω.math.clamp(midX, 0, map.w - env.w);
			pos.y = Ω.math.clamp(midY, -80, map.h - env.h);

			return true;

		},

		findPlayer (e) {

			let {map, graph, player} = this,
				{w, h} = map.sheet,
				nodes = graph.nodes,
				from = nodes[e.y / w | 0][e.x / h | 0],
				to = nodes[player.y / w | 0][player.x / h | 0];

			// Recompute A*
			return Ω.Math.aStar.search(nodes, from, to);

		},

		generateMap (width, length) {

			let cells = [];

			for (let j = 0; j < length; j++) {
				cells.push([]);
				for (let i = 0; i < width; i++) {
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

		generateBeachPeeps (sbs, beerSpawns) {

			let cells = this.map.cells;

			this.stands = beerSpawns.map((s) => this.add(new window.BeerStand(s.x, s.y)));

			this.sunbathers = [];

			sbs.forEach((sb) => {
				let {x, y, type} = sb;

				let sunbather = this.add(
					new window.BeachBum(
						x,
						y,
						Ω.utils.rand(2)
					), "extras", 2);

				this.sunbathers.push(sunbather);

				// Unwalkableize the beach where sunbathers are
				let noWalk = this.walkableSandCells + this.sheet.cellW + 1;
				let [c, r] = this.map.getBlockCell([x, y]);

				cells[r][c] = noWalk;
				cells[r + 1][c] = noWalk;
			});

		},

		generateTreasures (level, map) {
			let numTreasures = level.properties.num_treasures,
				toAdd = numTreasures,
				{cellW, cellH, cells} = map;

			// Create empty map
			let t = cells.map((r) => r.map((c) => 0));

			// Add treasures
			while (toAdd) {
				let rx = Ω.utils.rand(cellW),
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

		generateAStar (map) {

			let toDig = 0;

			// Do some A* path findin': convert map to 1 == walkable
			let cells = map.cells.map((r) => {
				// Map the level grid to 1's and 0's
				return r.map((c) => {
					let cell = c > map.walkable ? 1 : 0;
					if (cell === 0) {
						toDig++;
					}
					return cell;
				});
			});

			return [toDig, new Ω.Math.aStar.Graph(cells)];
		},

		render () {}

	});

	window.Beach = Beach;

}(window.Ω));
