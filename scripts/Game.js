(function (Ω) {

    "use strict";

    var LD29 = Ω.Game.extend({

        canvas: "#board",

        fps: false,

        init: function (w, h) {

            this._super(w, h);

            Ω.input.bind({
                "touch": "touch",
                "escape": "escape",
                "left": ["left", "a"],
                "right": ["right", "d"],
                "up": ["up", "w"],
                "down": ["down", "s"],
                "moused": "mouse1",
                "fire": ["space", "touch", "mouse1"],
                "dig": 88
            });

             Ω.utils.colors.set("c64");

        },

        load: function () {

            this.reset();

        },

        reset: function () {

            this.setScreen(new window.TitleScreen());

        }

    });

    window.LD29 = LD29;

}(Ω));
