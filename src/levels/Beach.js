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

			new Ω.Tiled(`res/levels/${ name }?${ Date.now() }`, (level) => {

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
			var map = this.generateMap(w, h);
			this.map = map.map;
			this.w = this.map.w;
			this.h = this.map.h;
			let beach = level.layer("beach");
			this.map.cells = beach.get().data;

			// 2. Add sunbathers/beer stand
			let spawns = level.layer("spawns");
			this.copSpawn = spawns.name("cop_spawn");
			this.playerSpawn = spawns.name("player_spawn");
			this.generateBeachPeeps(
				spawns.type("sb_man").concat(spawns.type("sb_lady")),
				spawns.type("beer_stand")
			);

			// 3. Add treasure
			let [numTreasures, treasureMap] = this.generateTreasures(level, map);
			this.treasure = treasureMap;
			this.numTreasures = numTreasures;

			// 4. Figure out a*
			let [toDig, graph] = this.generateAStar(this.map);
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
				treasure = this.treasure[blockCellPos[1]][blockCellPos[0]];
				if (treasure && removeIfFound) {
					this.treasure[blockCellPos[1]][blockCellPos[0]] = 0;
				}
			}
			return treasure;
		},

		dig (player, stage) {
			let blockPixPos = [player.x + player.center.x, player.y + player.center.y];

			this.map.setBlock(blockPixPos, this.sheet.cellW + 6 + stage); // Ummmm... what is 6?
		},

		tick () {

			// Todo: this should be mainscreen

			let player = this.player;

			this.pos.x = player.x - (Ω.env.w / 2) + player.center.y;
			this.pos.y = player.y - (Ω.env.h / 2);

			this.pos.x = Ω.math.clamp(this.pos.x, 0, this.map.w - this.env.w);
			this.pos.y = Ω.math.clamp(this.pos.y, -80, this.map.h - this.env.h);

			return true;

		},

		findPlayer (e) {

			let w = this.map.sheet.w;
			let h = this.map.sheet.h;

			// Recompute A*
			return Ω.Math.aStar.search(
				this.graph.nodes,
				this.graph.nodes[e.y / w | 0][e.x / h | 0],
				this.graph.nodes[this.player.y / w | 0][this.player.x / h | 0]
			);

		},

		generateMap (width, length) {

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
						type === "sb_lady" ? 0 : 1
					), "extras", 2);

				this.sunbathers.push(sunbather);

				// Unwalkableize the beach where sunbathers are
				var cell = this.map.getBlockCell([sunbather.x, sunbather.y]);
				cells[cell[1]][cell[0]] = this.walkableSandCells + this.sheet.cellW + 1;
				cells[cell[1] + 1][cell[0]] = this.walkableSandCells + this.sheet.cellW + 1;

			});

		},

		generateTreasures (level, map) {
			let numTreasures = level.properties.num_treasures;
			return [numTreasures, map.treasure];
		},

		generateAStar (map) {

			let toDig = 0;

			// Do some A* path findin': convert map to 1 == walkable
			let cells = map.cells.map((r) => {
				// Map the level grid to 1's and 0's
				return r.map((c) => {
					var cell = c > map.walkable ? 1 : 0;
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
