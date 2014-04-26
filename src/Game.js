(function (Ω) {

    "use strict";

    var LD29 = Ω.Game.extend({

        canvas: "#board",

        init: function (w, h) {

            this._super(w, h);

            Ω.input.bind({
                "space": "space",
                "touch": "touch",
                "escape": "escape",
                "left": ["left", "a"],
                "right": ["right", "d"],
                "up": ["up", "w"],
                "down": ["down", "s"],
                "moused": "mouse1"
            });

        },

        load: function () {

            this.setScreen(new window.MainScreen());

        }

    });

    window.LD29 = LD29;

}(Ω));
