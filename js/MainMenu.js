BasicGame.MainMenu = function (game) {


};

BasicGame.MainMenu.prototype = {

    preload: function () {

    },
    create : function() {
        this.game.state.start('Game');
    }
};