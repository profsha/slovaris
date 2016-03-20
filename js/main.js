
var alphabet = {total: 0};
var dict = {
    //Добавление буквы в словарь
    add : function(letter, dict) {
        if (!dict[letter]) {
            dict[letter] = {};
        }
        return dict[letter];
    },
    //Поиск в строке слова из словаря
    findWord : function(str) {
        var m = this;
        for (var i = 0; i <= str.length; ++i) {
            if (m[str[i]]) {
                m = m[str[i]];
            }
            else if (m.end) {
                return str.substring(0,i);
            }
            //else if (str.length >= this.min){
            //    return dict.findWord(str.substring(1));
            //}
            else {
                return "";
            }
        }
    },
    findIn : function(str, reverse) {
        var s = str; //строка поиска
        var result = []; //массив найденых слов
        var count = 0;//счетчик начала слова
        while (s.length >= this.min) {
            var word = this.findWord(s);
            if (word ) {
                var obj = {
                    word: word,
                    first: count,
                    length: word.length,
                    reverse: reverse
                };
                result.push(obj);
            }
            s = s.substring(1);
            ++count;
        }

        return result;
    }
};

generateLetter = function() {
    var rand = Math.floor(Math.random() * (alphabet.total + 1));
    for (var letter in alphabet) {
        if (alphabet[letter] >= rand && alphabet[letter] != alphabet.total) {
            //console.log(letter);
            return letter;
        }
    }
};

$.getJSON('etc/dict.json', function(data) {
    dict.min = 100;
    for (var i = 0; i < data.dict.length; ++i) {
        if (dict.min > data.dict[i].length) {
            dict.min = data.dict[i].length;
        }
        var m = dict;
        for (var j = 0; j < data.dict[i].length; ++j) {

            //Подсчет букв
            ++alphabet.total;
            if (alphabet[data.dict[i][j]]) {
                ++alphabet[data.dict[i][j]];
            }
            else {
                alphabet[data.dict[i][j]] = 1;
            }

            //Создание словаря
            m = dict.add(data.dict[i][j], m);
        }
        m.end = true;
    }

    //Подсчет частоты букв
    var sum = 0;
    for (var letter in alphabet) {
        if (alphabet[letter] != alphabet.total) {
            //alphabet[letter] = alphabet[letter] / alphabet.total;
            sum += alphabet[letter];
            alphabet[letter] = sum;
        }
    }
});

//$.get('etc/dict.txt', function(data) {
//    var newData = data.split("\n");
//    //console.log(newStr);
//    var word = "";
//    for (var i = 0; i < newData.length - 1; ++i) {
//        var reg = /(.[^\|]*)\|(.*)\|.*\|.*\|.*\|(.[^\|]*)\|.*/ig;
//        var arr = reg.exec(newData[i]);
//        if (arr[1].length < 3) {
//            continue;
//        }
//        if (arr[1].indexOf("...") > -1 || arr[2].indexOf("...") > -1) {
//            continue;
//        }
//        if (/(ий|ой|ый|ое|ее|ей|цы)$/.test(arr[1])) {
//            continue;
//        }
//        if (arr[1] == word) {
//            continue;
//        }
//        word = arr[1];
//        $("#textDict").append(arr[1] + "<br>");
//    }
//
//});

var game = new Phaser.Game(700, 700, Phaser.AUTO, "gameContainer");
game.state.add('Boot', BasicGame.Boot);
game.state.add('Preloader', BasicGame.Preloader);
game.state.add('MainMenu', BasicGame.MainMenu);
game.state.add('Game', BasicGame.Game);
game.state.start('Boot');



