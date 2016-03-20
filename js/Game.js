BasicGame.Game = function (game) {

};

BasicGame.Game.prototype = {
    timeControl: 300,
    currentTimeControl: 0,
    timeTick: 2000,
    forceTimeTick: 300,
    currentTimeTick: 0,
    cellWidth: 70,
    cellHeight: 70,
    fieldWidth: 10,
    fieldHeight: 10,
    finished: false,
    checkControl: function() {
        if (this.keys.left.isDown) {
            this.field.moveLeft();
        }
        else if (this.keys.right.isDown) {
            this.field.moveRight();
        }
        else if (this.keys.up.isDown) {
            this.field.rotate();
        }
        else if (this.keys.down.isDown) {
            this.field.force();
        }
    },
    preload: function () {

    },
    create : function() {
        this.game.stage.backgroundColor = 0xF5F5F5;
        this.field = new Field(this);
        this.keys = this.game.input.keyboard.createCursorKeys();
        this.keys.up.onDown.add(function(){
            this.currentTimeControl = 0;
            this.field.rotate()
        }, this);
        this.keys.down.onDown.add(function(){
            this.currentTimeControl = 0;
            this.field.force()
        }, this);
        this.keys.left.onDown.add(function(){
            this.currentTimeControl = 0;
            this.field.moveLeft()
        }, this);
        this.keys.right.onDown.add(function(){
            this.currentTimeControl = 0;
            this.field.moveRight()
        }, this);

        this.field.createFigure();
    },
    update : function() {
        if (!this.finished) {
            this.currentTimeControl += this.time.elapsed;
            this.currentTimeTick += this.time.elapsed;
            if (this.currentTimeControl > this.timeControl) {
                this.checkControl();
                this.currentTimeControl = 0;
            }
            if (this.currentTimeTick > (this.field.controlable ? this.timeTick : this.forceTimeTick)) {
                this.field.nextTick();
                this.currentTimeTick = 0;
            }
        }
    },
    paused : function() {
        console.log("paused");
    },
    shutdown : function() {

    },
    finish : function() {
        this.finished = true;
        console.log("finish");
    }
};

Cell = function(state, x, y, letter, parent) {
    this.state = state;
    this.parent = parent || {};
    this.x = (x || 0);
    this.y = (y || 0);
    this.width = this.state.cellWidth || 70;
    this.height = this.state.cellHeight || 70;
    this.graphics = this.state.add.graphics((this.x + (this.parent.x || 0)) * this.width, (this.y + (this.parent.y || 0)) * this.height);
    this.graphics.lineStyle(5, 0xF5DEB5, 1);
    this.graphics.beginFill(0xC7D0CC, 1);
    this.graphics.drawRoundedRect(0, 0, this.width, this.height, 8);
    //this.graphics.drawCircle(x + width / 2, y + height / 2, 70);
    this.letter = letter || "";
    this.text = this.state.add.text((this.x  + (this.parent.x || 0)) * this.width + this.width / 2, (this.y + (this.parent.y || 0)) * this.height + this.height / 2, this.letter, { fill: '#505050', font: "30px Arial", align: "center"});
    this.text.anchor.setTo(0.5, 0.5);
    this.tween = null;


};

Cell.prototype = {
    controllable: false,
    active: false,
    moveTo : function(x, y) {
        this.x = x || 0;
        this.y = y || 0;
        this.graphics.position.setTo((this.x + (this.parent.x || 0)) * this.width, (this.y + (this.parent.y || 0)) * this.height);
        this.text.position.setTo((this.x + (this.parent.x || 0)) * this.width + this.width / 2, (this.y + (this.parent.y || 0)) * this.height + this.height / 2);
    },
    move: function() {
        this.graphics.position.setTo((this.x + (this.parent.x || 0)) * this.width, (this.y + (this.parent.y || 0)) * this.height);
        this.text.position.setTo((this.x + (this.parent.x || 0)) * this.width + this.width / 2, (this.y + (this.parent.y || 0)) * this.height + this.height / 2);
    },
    focus: function() {
        this.text.fill = '#00ff00';
    },
    destroy : function() {
        if (this.tween) {
            this.tween.destroy(true);
        }
        this.graphics.destroy(true);
        this.text.destroy(true);
    },
    hide: function() {
        if (!this.tween) {
            this.tween = this.state.add.tween(this.text).to({height: 0}, 1000, Phaser.Easing.Bounce.Out, true).onComplete.add(function () {
                console.log(this);
                this.tween = null;
                this.destroy();
            }, this);
            this.state.add.tween(this.graphics).to({height: 0}, 1000, Phaser.Easing.Bounce.Out, true);
        }
    }
};

Figure = function(state) {
    this.state = state;
    this.x = 0;
    this.y = 0;
    this.cells = [];
    this.controlable = false;
};

Figure.prototype = {
    createNew: function(x, y) {
        this.cells = [];
        this.x = x || 0;
        this.y = y || 0;
        var direction = 0;
        var oldCell = null;
        var minX = 10;
        var minY = 10;
        for (var i = 0; i < 4; ++i) {
            var cell;
            switch(direction) {
                case 0:
                    cell = new Cell(this.state, 0, 0, generateLetter(), this);
                    break;
                case 1:
                    cell = new Cell(this.state, oldCell.x + 1, oldCell.y, generateLetter(), this);
                    break;
                case 3:
                    cell = new Cell(this.state, oldCell.x - 1, oldCell.y, generateLetter(), this);
                    break;
                case 2:
                    cell = new Cell(this.state, oldCell.x, oldCell.y + 1, generateLetter(), this);
                    break;
                case 4:
                    cell = new Cell(this.state, oldCell.x, oldCell.y - 1, generateLetter(), this);
                    break;
            }

            cell.active = true;

            if (!this.state.difficult || this.state.difficult == "easy") {
                direction = i + 1;
            }
            else {
                var rand = 1 + Math.floor(Math.random() * (4));
                if (!(direction != rand && rand % 2 == direction % 2) || direction == 0) {
                    direction = rand;
                }
            }
            if (minX > cell.x) {
                minX = cell.x;
            }
            if (minY > cell.y) {
                minY = cell.y;
            }
            this.cells.push(cell);
            oldCell = cell;
        }
        if (minY < 0) {
            for (var i = 0; i < 4; ++i) {
                this.cells[i].y -= minY;
                this.cells[i].move();
            }
        }
        if (minX < 0) {
            for (var i = 0; i < 4; ++i) {
                this.cells[i].x -= minX;
                this.cells[i].move();
            }
        }
    },
    getWidth: function() {
        var max = -10;
        var min = 10;
        for (var i = 0; i < this.cells.length; ++i) {
            if (this.cells[i].x > max) {
                max = this.cells[i].x;
            }
            if (this.cells[i].x < min) {
                min = this.cells[i].x;
            }
        }
        return Math.abs(max - min) + 1;
    },
    getHeight: function() {
        var max = -10;
        var min = 10;
        for (var i = 0; i < this.cells.length; ++i) {
            if (this.cells[i].y > max) {
                max = this.cells[i].y;
            }
            if (this.cells[i].y < min) {
                min = this.cells[i].y;
            }
        }
        return Math.abs(max - min) + 1;
    },
    getCenterPoint: function() {
        var maxX = -10;
        var minX = 10;
        var maxY = -10;
        var minY = 10;
        for (var i = 0; i < this.cells.length; ++i) {
            if (this.cells[i].x > maxX) {
                maxX = this.cells[i].x;
            }
            if (this.cells[i].x < minX) {
                minX = this.cells[i].x;
            }
            if (this.cells[i].y > maxY) {
                maxY = this.cells[i].y;
            }
            if (this.cells[i].y < minY) {
                minY = this.cells[i].y;
            }
        }
        return {x: Math.ceil((maxX - minX) / 2), y: Math.ceil((maxY - minY) / 2)};
    },
    rotate: function() {
            var point = this.getCenterPoint();

            for (var i = 0; i < this.cells.length; ++i) {
                var oldPos = {x: this.cells[i].x, y: this.cells[i].y};
                this.cells[i].x = -oldPos.y + point.y;
                this.cells[i].y = oldPos.x;
                //console.log(oldPos, {x: this.cells[i].x, y: this.cells[i].y});
                this.cells[i].move();
            }
    },
    move: function(dir) {
            switch (dir) {
                case "left":
                    --this.x;
                    for (var i = 0; i < this.cells.length; ++i) {
                        this.cells[i].move();
                    }
                    break;
                case "right":
                    ++this.x;
                    for (var i = 0; i < this.cells.length; ++i) {
                        this.cells[i].move();
                    }
                    break;
                case "down":
                    ++this.y;
                    for (var i = 0; i < this.cells.length; ++i) {
                        this.cells[i].move();
                    }
                    break;
            }
    }
};

Field = function(state) {
    this.state = state;
    this.width = state.fieldWidth;
    this.height = state.fieldHeight;
    this.figure = new Figure(state);
    this.graphics = state.add.graphics(0,0);
    this.graphics.beginFill(0xF5DEB5, 1);
    this.graphics.drawRoundedRect(0, 0, this.width * 70, this.height * 70, 8);
    this.cells = [];
    for (var i = 0; i < this.width; ++i) {
        this.cells[i] = [];
        for (var j = 0; j < this.height; ++j) {
            this.cells[i][j] = null;
        }
    }
    //for (var j = 0; j < this.height; ++j) {
    //    this.cells[j][0] = new Cell(this.state, j, 0, 70, 70, generateLetter(), this);
    //}
};

Field.prototype = {
    nextTick: function() {
        var res = this.checkMove("down");
        if (!res.length) {
            this.figure.move("down");
            this.state.currentTimeTick = 0;
        }
        else {
            this.figureToField(res);
        }
    },
    moveLeft: function() {
        if (this.controlable) {
            console.log("left is down");
            if (!this.checkMove("left").length) {
                this.figure.move("left");
            }
        }
    },
    moveRight: function() {
        if (this.controlable) {
            console.log("right is down");
            if (!this.checkMove("right").length) {
                this.figure.move("right");
            }
        }
    },
    rotate: function() {
        if (this.controlable) {
            console.log("up is down");
            this.figure.rotate();
        }
    },
    force: function() {
        if (this.controlable) {
            console.log("down is down");
            if (!this.checkMove("down").length) {
                this.figure.move("down");
                this.state.currentTimeTick = 0;
            }
        }
    },
    checkMove: function(dir) {
        var len = this.figure.cells.length;
        var result = [];
        switch (dir) {
            case "left":
                for (var i = 0; i < len; ++i) {
                    if (!this.cells[this.figure.x + this.figure.cells[i].x - 1] || this.cells[this.figure.x + this.figure.cells[i].x - 1][this.figure.cells[i].y + this.figure.y] != null) {
                        result.push(i);
                    }
                }
                break;
            case "right":
                for (var i = 0; i < len; ++i) {
                    if (!this.cells[this.figure.x + this.figure.cells[i].x + 1] || this.cells[this.figure.x + this.figure.cells[i].x + 1][this.figure.cells[i].y + this.figure.y] != null) {
                        result.push(i);
                    }
                }
                break;
            case "down":
                for (var i = 0; i < len; ++i) {
                    if (this.cells[this.figure.x + this.figure.cells[i].x][this.figure.cells[i].y + this.figure.y + 1] != null ||
                        this.cells[this.figure.x + this.figure.cells[i].x][this.figure.cells[i].y + this.figure.y + 1] === undefined) {
                        result.push(this.figure.cells[i].x);
                    }
                }
                break;
        }
        return result;
    },
    checkWords: function() {
        var str = "";
        var result = [];
        for (var j = this.height - 1; j >= 0; --j) {
            for (var i = 0; i < this.width; ++i) {
                if (this.cells[i][j] != null && this.cells[i][j].active) {
                    continue;
                }
                if (this.cells[i][j] == null) {
                    str += " ";
                }
                else {
                    str += this.cells[i][j].letter;
                }
            }
            result[j] = dict.findIn(str, false);

            for(var l = 0; l < result[j].length; ++l) {
                console.log(result[j][l]);
                for(var s = 0; s < result[j][l].length; ++s) {

                    this.cells[s + result[j][l].first][j].hide();
                    this.cells[s + result[j][l].first][j] = null;
                }
            }
            str = str.split('').reverse().join('');

            result[j] = dict.findIn(str, true);
            for(var l = 0; l < result[j].length; ++l) {
                console.log(result[j][l]);
                for(var s = 0; s < result[j][l].length; ++s) {
                    if (this.cells[this.width - result[j][l].first - s - 1][j] != null) {
                        this.cells[this.width - result[j][l].first - s - 1][j].hide();
                        this.cells[this.width - result[j][l].first - s - 1][j] = null;
                    }
                }
            }
            str = "";
        }

    },
    figureToField: function(cells) {
        this.controlable = false;
        var lenCol = cells.length;
        for (var j = 0; j < lenCol; ++j) {
            for (var i = 0; i < this.figure.cells.length; ++i) {
                if (this.figure.cells[i].x == cells[j]) {
                    this.figure.cells[i].active = false;
                    this.figure.cells[i].parent = this;
                    this.cells[this.figure.x + this.figure.cells[i].x][this.figure.cells[i].y + this.figure.y] = this.figure.cells[i];
                    this.figure.cells.splice(i, 1);
                    --i;
                }
            }
        }
        if (!this.figure.cells.length) {
            this.checkWords();
            this.createFigure();
        }
    },
    createFigure: function() {
        this.figure.createNew(Math.round(this.width / 2) - 1, 0);
        for (var i = 0; i < 4; ++i) {
            if (this.cells[this.figure.x + this.figure.cells[i].x][this.figure.cells[i].y + this.figure.y] != null){
                this.state.finish();
                return;
            }
        }
        this.controlable = true;
    }
};