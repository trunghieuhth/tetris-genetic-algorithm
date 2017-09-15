/*! JavaScript
 * ================================================================/
 *  Project:    tetris-genetic-algorithm
 *  Version:    v2015.01 remake
 *  Github:     https://github.com/trunghieuhth/tetris-genetic-algorithm
 *  Author:     Hoang Trung Hieu
 *  Website:    https://hieuht.com
 * ================================================================/
 */

/*
 * GRID
 * -----------------
 */

function Grid(rows, columns){
    this.rows = rows;
    this.columns = columns;

    this.cells = new Array(rows);
    for (var r = 0; r < this.rows; r++) {
        this.cells[r] = new Array(this.columns);
        for(var c = 0; c < this.columns; c++){
            this.cells[r][c] = 0;
        }
    }
}


Grid.prototype.clone = function(){
    var _grid = new Grid(this.rows, this.columns);
    for (var r = 0; r < this.rows; r++) {
        for(var c = 0; c < this.columns; c++){
            _grid.cells[r][c] = this.cells[r][c];
        }
    }
    return _grid;
};

Grid.prototype.clearLines = function(){
    var distance = 0;
    // var row = new Array(this.columns);
    for(var r = this.rows - 1; r >= 0; r--){
        if (this.isLine(r)){
            distance++;
            for(var cc = 0; cc < this.columns; cc++){
                this.cells[r][cc] = 0;
            }
        }else if (distance > 0){
            for(var ccc = 0; ccc < this.columns; ccc++){
                this.cells[r + distance][ccc] = this.cells[r][ccc];
                this.cells[r][ccc] = 0;
            }
        }
    }
    return distance;
};

// Computations
Grid.prototype.isLine = function(row){
    for(var c = 0; c < this.columns; c++){
        if (this.cells[row][c] === 0){
            return false;
        }
    }
    return true;
};

Grid.prototype.isEmptyRow = function(row){
    for(var c = 0; c < this.columns; c++){
        if (this.cells[row][c] === 1){
            return false;
        }
    }
    return true;
};

Grid.prototype.exceeded = function(){
    return !this.isEmptyRow(0) || !this.isEmptyRow(1);
};

Grid.prototype.height = function(){
    var r = 0;
    for(; r < this.rows && this.isEmptyRow(r); r++);
    return this.rows - r;
};

Grid.prototype.lines = function(){
    var count = 0;
    for(var r = 0; r < this.rows; r++){
        if (this.isLine(r)){
            count++;
        }
    }
    return count;
};

Grid.prototype.holes = function(){
    var count = 0;
    for(var c = 0; c < this.columns; c++){
        var block = false;
        for(var r = 0; r < this.rows; r++){
            if (this.cells[r][c] === 1) {
                block = true;
            }else if (this.cells[r][c] === 0 && block){
                count++;
            }
        }
    }
    return count;
};

Grid.prototype.blockades = function(){
    var count = 0;
    for(var c = 0; c < this.columns; c++){
        var hole = false;
        for(var r = this.rows - 1; r >= 0; r--){
            if (this.cells[r][c] === 0){
                hole = true;
            }else if (this.cells[r][c] === 1 && hole){
                count++;
            }
        }
    }
    return count;
};

Grid.prototype.aggregateHeight = function(){
    var total = 0;
    for(var c = 0; c < this.columns; c++){
        total += this.columnHeight(c);
    }
    return total;
};

Grid.prototype.bumpiness = function(){
    var total = 0;
    for(var c = 0; c < this.columns - 1; c++){
        total += Math.abs(this.columnHeight(c) - this.columnHeight(c+ 1));
    }
    return total;
};

Grid.prototype.columnHeight = function(column){
    var r = 0;
    for(; r < this.rows && this.cells[r][column] === 0; r++);
    return this.rows - r;
};

Grid.prototype.addPiece = function(piece) {
    for(var r = 0; r < piece.cells.length; r++) {
        for (var c = 0; c < piece.cells[r].length; c++) {
            var _r = piece.row + r;
            var _c = piece.column + c;
            if (piece.cells[r][c] === 1 && _r >= 0){
                this.cells[_r][_c] = 1;
            }
        }
    }
};

Grid.prototype.valid = function(piece){
    for(var r = 0; r < piece.cells.length; r++){
        for(var c = 0; c < piece.cells[r].length; c++){
            var _r = piece.row + r;
            var _c = piece.column + c;
            if (piece.cells[r][c] === 1){
                if (!(_c < this.columns && _r < this.rows && this.cells[_r][_c] === 0)){
                    return false;
                }
            }
        }
    }
    return true;
};

Grid.prototype.canMoveDown = function(piece){
    for(var r = 0; r < piece.cells.length; r++){
        for(var c = 0; c < piece.cells[r].length; c++){
            var _r = piece.row + r + 1;
            var _c = piece.column + c;
            if (piece.cells[r][c] === 1 && _r >= 0){
                if (!(_r < this.rows && this.cells[_r][_c] === 0)){
                    return false;
                }
            }
        }
    }
    return true;
};

Grid.prototype.canMoveLeft = function(piece){
    for(var r = 0; r < piece.cells.length; r++){
        for(var c = 0; c < piece.cells[r].length; c++){
            var _r = piece.row + r;
            var _c = piece.column + c - 1;
            if (piece.cells[r][c] === 1){
                if (!(_c >= 0 && this.cells[_r][_c] === 0)){
                    return false;
                }
            }
        }
    }
    return true;
};

Grid.prototype.canMoveRight = function(piece){
    for(var r = 0; r < piece.cells.length; r++){
        for(var c = 0; c < piece.cells[r].length; c++){
            var _r = piece.row + r;
            var _c = piece.column + c + 1;
            if (piece.cells[r][c] === 1){
                if (!(_c >= 0 && this.cells[_r][_c] === 0)){
                    return false;
                }
            }
        }
    }
    return true;
};

Grid.prototype.rotateOffset = function(piece){
    var _piece = piece.clone();
    _piece.rotate(1);
    if (this.valid(_piece)) {
        return {rowOffset: _piece.row - piece.row, columnOffset:_piece.column - piece.column};
    }

    // Kicking
    var initialRow = _piece.row;
    var initialCol = _piece.column;

    for (var i = 0; i < _piece.dimension - 1; i++) {
        _piece.column = initialCol + i;
        if (this.valid(_piece)) {
            return {rowOffset: _piece.row - piece.row, columnOffset:_piece.column - piece.column};
        }

        for (var j = 0; j < _piece.dimension - 1; j++) {
            _piece.row = initialRow - j;
            if (this.valid(_piece)) {
                return {rowOffset: _piece.row - piece.row, columnOffset:_piece.column - piece.column};
            }
        }
        _piece.row = initialRow;
    }
    _piece.column = initialCol;

    for (var i = 0; i < _piece.dimension - 1; i++) {
        _piece.column = initialCol - i;
        if (this.valid(_piece)) {
            return {rowOffset: _piece.row - piece.row, columnOffset:_piece.column - piece.column};
        }

        for (var j = 0; j < _piece.dimension - 1; j++) {
            _piece.row = initialRow - j;
            if (this.valid(_piece)) {
                return {rowOffset: _piece.row - piece.row, columnOffset:_piece.column - piece.column};
            }
        }
        _piece.row = initialRow;
    }
    _piece.column = initialCol;

    return null;
};

/*
 * PIECE
 * -----------------
 */

function Piece(cells){
    this.cells = cells;

    this.dimension = this.cells.length;
    this.row = 0;
    this.column = 0;
}

Piece.fromIndex = function(index){
    var piece;
    switch (index){
        case 0:// O
            piece = new Piece([
                [1, 1],
                [1, 1]
            ]);
            break;
        case 1: // J
            piece = new Piece([
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ]);
            break;
        case 2: // L
            piece = new Piece([
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ]);
            break;
        case 3: // Z
            piece = new Piece([
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ]);
            break;
        case 4: // S
            piece = new Piece([
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ]);
            break;
        case 5: // T
            piece = new Piece([
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ]);
            break;
        case 6: // I
            piece = new Piece([
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ]);
            break;

    }
    piece.row = 0;
    piece.column = Math.floor((10 - piece.dimension) / 2); // Centralize
    return piece;
};

Piece.prototype.clone = function(){
    var _cells = new Array(this.dimension);
    for (var r = 0; r < this.dimension; r++) {
        _cells[r] = new Array(this.dimension);
        for(var c = 0; c < this.dimension; c++){
            _cells[r][c] = this.cells[r][c];
        }
    }

    var piece = new Piece(_cells);
    piece.row = this.row;
    piece.column = this.column;
    return piece;
};

Piece.prototype.rotate = function(rotations){
    for(var i = 0; i < rotations; i++) {
        var _cells = new Array(this.dimension);
        for (var r = 0; r < this.dimension; r++) {
            _cells[r] = new Array(this.dimension);
        }

        switch (this.dimension) { // Assumed square matrix
            case 2:
                _cells[0][0] = this.cells[1][0];
                _cells[0][1] = this.cells[0][0];
                _cells[1][0] = this.cells[1][1];
                _cells[1][1] = this.cells[0][1];
                break;
            case 3:
                _cells[0][0] = this.cells[2][0];
                _cells[0][1] = this.cells[1][0];
                _cells[0][2] = this.cells[0][0];
                _cells[1][0] = this.cells[2][1];
                _cells[1][1] = this.cells[1][1];
                _cells[1][2] = this.cells[0][1];
                _cells[2][0] = this.cells[2][2];
                _cells[2][1] = this.cells[1][2];
                _cells[2][2] = this.cells[0][2];
                break;
            case 4:
                _cells[0][0] = this.cells[3][0];
                _cells[0][1] = this.cells[2][0];
                _cells[0][2] = this.cells[1][0];
                _cells[0][3] = this.cells[0][0];
                _cells[1][3] = this.cells[0][1];
                _cells[2][3] = this.cells[0][2];
                _cells[3][3] = this.cells[0][3];
                _cells[3][2] = this.cells[1][3];
                _cells[3][1] = this.cells[2][3];
                _cells[3][0] = this.cells[3][3];
                _cells[2][0] = this.cells[3][2];
                _cells[1][0] = this.cells[3][1];

                _cells[1][1] = this.cells[2][1];
                _cells[1][2] = this.cells[1][1];
                _cells[2][2] = this.cells[1][2];
                _cells[2][1] = this.cells[2][2];
                break;
        }

        this.cells = _cells;
    }
};

/*
 * GAME MANAGER
 * -----------------
 */

function GameManager(){
    this.gridCanvas = document.getElementById('root');
    this.nextCanvas = document.getElementById('next-block');
    this.scoreContainer = document.getElementById("score");
    this.resetButton = document.getElementById('restart-button');
    this.aiButton = document.getElementById('ai-button');
    this.restartModalButton = document.getElementById('restart-modal-button');

    this.gravityUpdater = new Updater();
    this.gravityUpdater.skipping = this.aiActive;
    this.gravityUpdater.onUpdate(function(){
        self.applyGravity();
        self.actuate();
    });

    var self = this;
    document.addEventListener("keydown", function (event){
        switch(event.which){
            case 32: //drop
                self.drop();
                self.gravityUpdater.doUpdate(Date.now());
                break;
            case 40: //down
                self.gravityUpdater.doUpdate(Date.now());
                break;
            case 37: //left
                self.moveLeft();
                self.actuate();
                break;
            case 39: //right
                self.moveRight();
                self.actuate();
                break;
            case 38: //up
                self.rotate();
                self.actuate();
                break;
        }
    });
    this.aiButton.onclick = function(){
        if (self.aiActive){
            self.stopAI();
        }else{
            self.startAI();
        }
    };
    this.resetButton.onclick = function(){
        self.setup();
    };
    this.restartModalButton.onclick = function () {
        $(".gameover-mask").removeClass("active");
        self.setup();
    };

    this.setup();
    //this.startAI();       //Tự động chơi ngay khi khởi tạo
    this.gravityUpdater.checkUpdate(Date.now());
}

GameManager.prototype.setup = function(){
    this.grid = new Grid(22, 10);
    this.rpg = new RandomPieceGenerator();
    //Cài đặt trí thông minh cho AI
    this.ai = new AI(0.510066, 0.760666, 0.35663, 0.184483);        //Intelligent AI
    // this.ai = new AI(0.1, 0.1, 0.1, 0.8);                         //Stupid AI
    this.workingPieces = [this.rpg.nextPiece(), this.rpg.nextPiece()];
    this.workingPiece = this.workingPieces[0];

    this.isOver = true;
    this.score = 0;

    this.stopAI();
    this.actuate();
};

var _sizeBlock = 30;

GameManager.prototype.actuate = function(){
    var _grid = this.grid.clone();
    if (this.workingPiece !== null) {
        _grid.addPiece(this.workingPiece);
    }

    var context = this.gridCanvas.getContext('2d');
    context.save();
    context.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);
    for(var r = 2; r < _grid.rows; r++){
        for(var c = 0; c < _grid.columns; c++){
            if (_grid.cells[r][c] === 1){
                context.fillStyle="#FF9326";    //Màu sắc piece Grid
                context.fillRect(_sizeBlock * c, _sizeBlock * (r - 2), _sizeBlock, _sizeBlock);
                context.strokeStyle="#454C57";
                context.strokeRect(_sizeBlock * c, _sizeBlock * (r - 2), _sizeBlock, _sizeBlock);
            }
        }
    }
    context.restore();

    context = this.nextCanvas.getContext('2d');
    context.save();
    context.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
    var next = this.workingPieces[1];
    var xOffset = next.dimension === 2 ? 20 : next.dimension === 3 ? 10 : next.dimension === 4 ? 0 : null;
    var yOffset = next.dimension === 2 ? 20 : next.dimension === 3 ? 20 : next.dimension === 4 ? 10 : null;
    for(var r = 0; r < next.dimension; r++){
        for(var c = 0; c < next.dimension; c++){
            if (next.cells[r][c] === 1){
                context.fillStyle="#FF9326";    //Màu sắc piece Next
                context.fillRect(xOffset + _sizeBlock * c, yOffset + _sizeBlock * r, _sizeBlock, _sizeBlock);
                context.strokeStyle="#454C57";
                context.strokeRect(xOffset + _sizeBlock * c, yOffset + _sizeBlock * r, _sizeBlock, _sizeBlock);
            }
        }
    }
    context.restore();

    this.scoreContainer.innerHTML = this.score.toString();
};

GameManager.prototype.startAI = function(){
    this.aiActive = true;
    this.gravityUpdater.skipping = true;
};

GameManager.prototype.stopAI = function(){
    this.aiActive = false;
    this.gravityUpdater.skipping = false;
};

GameManager.prototype.setWorkingPiece = function(){
    this.grid.addPiece(this.workingPiece);
    this.score += this.grid.clearLines();
    if (!this.grid.exceeded()){
        for(var i = 0; i < this.workingPieces.length - 1; i++){
            this.workingPieces[i] = this.workingPieces[i + 1];
        }
        this.workingPieces[this.workingPieces.length - 1] = this.rpg.nextPiece();
        this.workingPiece = this.workingPieces[0];
        if (this.aiActive) {
            this.aiMove();
            this.gravityUpdater.skipping = true;
        }
    }else{
        $('.gameover-mask').addClass('active');
        $(".close, .gameover-mask").on("click", function(){
            $(".gameover-mask").removeClass("active");
        });
    }
};

GameManager.prototype.applyGravity = function(){
    if (this.grid.canMoveDown(this.workingPiece)) {
        this.workingPiece.row++;
    }else{
        this.gravityUpdater.skipping = false;
        this.setWorkingPiece();
    }
};

GameManager.prototype.drop = function(){
    while(this.grid.canMoveDown(this.workingPiece)){
        this.workingPiece.row++;
    }
};

GameManager.prototype.moveLeft = function(){
    if (this.grid.canMoveLeft(this.workingPiece)){
        this.workingPiece.column--;
    }
};

GameManager.prototype.moveRight = function(){
    if (this.grid.canMoveRight(this.workingPiece)){
        this.workingPiece.column++;
    }
};

GameManager.prototype.rotate = function(){
    var offset = this.grid.rotateOffset(this.workingPiece);
    if (offset !== null){
        this.workingPiece.rotate(1);
        this.workingPiece.row += offset.rowOffset;
        this.workingPiece.column += offset.columnOffset;
    }
};

GameManager.prototype.aiMove = function(){
    this.workingPiece = this.ai.best(this.grid, this.workingPieces, 0).piece;
};


/*
 * RANDOM PIECE GENERATOR
 * -----------------
 */

function RandomPieceGenerator(){
    // Math.seed
    this.bag = [0, 1, 2, 3, 4, 5, 6];
    this.shuffleBag();
    this.index = -1;
}

RandomPieceGenerator.prototype.nextPiece = function(){
    this.index++;
    if (this.index >= this.bag.length){
        this.shuffleBag();
        this.index = 0;
    }
    return Piece.fromIndex(this.bag[this.index]);
};

RandomPieceGenerator.prototype.shuffleBag = function() {
    var currentIndex = this.bag.length
        , temporaryValue
        , randomIndex
    ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = this.bag[currentIndex];
        this.bag[currentIndex] = this.bag[randomIndex];
        this.bag[randomIndex] = temporaryValue;
    }
};

/*
 * AI USING GENETIC ALGORITHM
 * -----------------
 */

function AI(heightWeight, linesWeight, holesWeight, bumpinessWeight){
    this.heightWeight = heightWeight;
    this.linesWeight = linesWeight;
    this.holesWeight = holesWeight;
    this.bumpinessWeight = bumpinessWeight;
}

AI.prototype.best = function(grid, workingPieces, workingPieceIndex){
    var best = null;
    var bestScore = null;
    var workingPiece = workingPieces[workingPieceIndex];

    for(var rotation = 0; rotation < 4; rotation++){
        var _piece = workingPiece.clone();
        _piece.rotate(rotation);

        while(grid.canMoveLeft(_piece)){
            _piece.column --;
        }

        while(grid.valid(_piece)){
            var _pieceSet = _piece.clone();
            while(grid.canMoveDown(_pieceSet)){
                _pieceSet.row++;
            }

            var _grid = grid.clone();
            _grid.addPiece(_pieceSet);

            var score = null;
            if (workingPieceIndex === (workingPieces.length - 1)) {
                score = -this.heightWeight * _grid.aggregateHeight() + this.linesWeight * _grid.lines() - this.holesWeight * _grid.holes() - this.bumpinessWeight * _grid.bumpiness();
            }else{
                score = this.best(_grid, workingPieces, workingPieceIndex + 1).score;
            }

            if (score > bestScore || bestScore === null){
                bestScore = score;
                best = _piece.clone();
            }

            _piece.column++;
        }
    }

    return {piece:best, score:bestScore};
};

/*
 * UPDATER
 * -----------------
 */

function Updater(){
    this.lastUpdateTime = Date.now();
    this.deltaThreshold = 400;
    this.updateCallback = null;
    this.skipping = false;

    window.requestAnimFrame = function(){ // Polyfill
        return (
            window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(callback){
                window.setTimeout(callback, 1000 / 60);
            }
        );
    }();
}

Updater.prototype.onUpdate = function(callback){
    this.updateCallback = callback;
};

Updater.prototype.doUpdate = function(timestamp){
    if(this.updateCallback !== null){
        this.updateCallback();
    }
    this.lastUpdateTime = timestamp;
};

Updater.prototype.checkUpdate = function(timestamp){
    var self = this;
    var delta = timestamp - this.lastUpdateTime;

    if (this.skipping || delta > this.deltaThreshold){
        this.doUpdate(timestamp);
    }


    window.requestAnimFrame(function(){
        self.checkUpdate(Date.now());
    });
};



/*
 * RUN
 * -----------------
 */

var manager = new GameManager();
manager.actuate(manager.grid, manager.workingPiece);