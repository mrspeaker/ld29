(function (Ω) {

    "use strict";

    var BeachBum = Ω.Entity.extend({
        w: 32,
        h: 64,

        sheet: new Ω.SpriteSheet("res/images/extras.png", 32, 32),

	   	render: function (gfx) {

	       var c = gfx.ctx;

	       this.sheet.render(gfx, 0, 0, this.x, this.y);
	       this.sheet.render(gfx, 0, 1, this.x, this.y + 32);

	   }

	});

	window.BeachBum = BeachBum;

}(window.Ω));