BasicGame.Preloader = function (game) {


};

BasicGame.Preloader.prototype = {

    preload: function () {

    },
    create : function() {
        this.game.state.start('MainMenu');
    }
};