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
                "left": "left",
                "right": "right",
                "up": "up",
                "down": "down",
                "moused": "mouse1"
            });

        },

        load: function () {

            this.setScreen(new window.MainScreen());

        }

    });

    window.LD29 = LD29;

}(Ω));
