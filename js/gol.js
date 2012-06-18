var canvasWidth = 1120;
var canvasHeight = 460;
var canvas = document.getElementById("mainCanvas");

var period = 1000/60;

var grid = new Array();
var cellRadius = 10;
var cells = new Array();
var cellSymbol;
var rows = 0, columns = 0;
var loop;

paper.install(window);

var tool = new Tool();

window.onload = function()
{
	paper.setup("mainCanvas");

	init();

	loop = setInterval(runLoop, period);
}

function runLoop()
{
	update();
	view.draw();	
}

function init()
{
	var rectangle = new Rectangle(new Point(0, 0), new Point(cellRadius*2, cellRadius*2));
	var cellShape = new Path.Rectangle(rectangle);
	
	cellShape.fillColor = 'white';
	cellSymbol = new Symbol(cellShape);

	rows = canvasHeight / (cellRadius*2);
	columns = canvasWidth / (cellRadius*2);

	grid = new Array(rows);
	for(var i=0; i<=rows; i++){
		grid[i] = new Array(columns);
		for(var j=0; j<=columns; j++){
			var cell = new Cell(new Point(j, i));
			grid[i][j] = cell;
		}
	}

	console.log('r: '+rows+' | c: '+columns);
}

var isDown = false;

canvas.onmousedown = function(event){
	clearInterval(loop);
	isDown = true;
}

canvas.onmouseup = function(event){
	loop = setInterval(runLoop, period);	
	isDown = false;
}

canvas.onmousemove = function(event) {

	if(isDown){
		x = event.clientX - 120;
		y = event.clientY - canvas.offsetTop;

		var location = new Point();
		location.x = x - (x % (cellRadius*2));
		location.y = y - (y % (cellRadius*2));
		location.x /= (cellRadius*2);
		location.y /= (cellRadius*2);

	    var cell = grid[location.y][location.x];
	    if(!cell.isAlive) cell.create();	
	    view.draw();	
	}

}

function update()
{

	for(var i=0; i<rows; i++){
		for(var j=0; j<columns; j++){

			var cell = grid[i][j];
			var aliveNeighbours = 0;


			var upper = (i == 0) ? rows - 1: i - 1;
			var lower = (i == rows - 1) ? 0 : i + 1;
			var left = (j == 0) ? columns - 1 : j - 1;
			var right = (j == columns - 1) ? 0 : j + 1;

			if(grid[upper][left].isAlive) aliveNeighbours++;
			if(grid[i][left].isAlive) aliveNeighbours++;
			if(grid[lower][left].isAlive) aliveNeighbours++;

			if(grid[upper][j].isAlive) aliveNeighbours++;
			if(grid[lower][j].isAlive) aliveNeighbours++;

			if(grid[upper][right].isAlive) aliveNeighbours++;
			if(grid[i][right].isAlive) aliveNeighbours++;
			if(grid[lower][right].isAlive) aliveNeighbours++;


			if(cell.isAlive){

				if(aliveNeighbours < 2 || aliveNeighbours > 3){
					cell.destroy();
				}					
			}
			else{

				if(aliveNeighbours == 3)
					cell.create();
					
			}
		}
	}
}


function Cell(location)
{
	this.shape = undefined;
	this.location = location;

	var states = {
		dead: 0,
		reviving : 1,
		alive: 2,
		dying: 3
	};

	this.state = states.dead;
	this.isAlive = undefined;

	this.create = function()
	{
		this.shape = cellSymbol.place(this.location.multiply(cellRadius*2));

		this.state = states.alive;
		this.isAlive = true;
	}

	this.destroy = function()
	{
		this.shape.remove();
		this.state = states.dead;
		this.isAlive = false;

	}

	this.kill = function(){
		this.state = states.dying;
	}

	this.revive = function(){
		this.state = states.reviving;
	}

	this.render = function()
	{

	}
}
