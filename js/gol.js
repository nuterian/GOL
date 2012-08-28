var canvasWidth = 1120;
var canvasHeight = 460;
var canvas = document.getElementById("mainCanvas");

var period = 1000/20;

var grid = new Array();
var status_grid = new Array();
var cellRadius = 2;
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
	status_grid = new Array(rows);
	for(var i=0; i<=rows; i++){
		grid[i] = new Array(columns);
		status_grid[i] = new Array(columns);
		for(var j=0; j<=columns; j++){
			var cell = new Cell(new Point(j, i));
			grid[i][j] = cell;
			status_grid[i][j] = 0;
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
	    if(!cell.status){
			cell.create();
			status_grid[location.y][location.x] = 1;
		}	
	    view.draw();	
	}

}

function update()
{
	ts_grid = new Array(rows);
	for(var i=0; i<rows; i++){
		ts_grid[i] = new Array(columns);
		for(var j=0; j<columns; j++){

			ts_grid[i][j] = status_grid[i][j];
			var cell = grid[i][j];
			var aliveNeighbours = 0;

			var upper = (i == 0) ? rows - 1: i - 1;
			var lower = (i == rows - 1) ? 0 : i + 1;
			var left = (j == 0) ? columns - 1 : j - 1;
			var right = (j == columns - 1) ? 0 : j + 1;


			aliveNeighbours += (
				status_grid[upper][left]+
				status_grid[i][left]+
				status_grid[lower][left]+
				status_grid[upper][j]+
				status_grid[lower][j]+
				status_grid[upper][right]+
				status_grid[i][right]+
				status_grid[lower][right]);				

			if(cell.status == 1){

				if(aliveNeighbours != 2 && aliveNeighbours != 3){
					cell.destroy();
					ts_grid[i][j] = 0;
				}					
			}
			else{

				if(aliveNeighbours == 3){
					cell.create();
					ts_grid[i][j] = 1;
				}
					
			}
		}
	}

	status_grid = new Array(rows);
	for(var i=0; i<rows; i++){
		status_grid[i] = new Array(columns);
		for(var j=0; j<columns; j++){
			status_grid[i][j] = ts_grid[i][j];
		}
	}
}


function Cell(location)
{
	this.shape = undefined;
	this.location = location;
	this.status = 0;

	this.create = function()
	{
		this.shape = cellSymbol.place(this.location.multiply(cellRadius*2));
		this.status = 1;
	}

	this.destroy = function()
	{
		this.shape.remove();
		this.status = 0;

	}

/*
	this.kill = function(){
		this.state = states.dying;
	}

	this.revive = function(){
		this.state = states.reviving;
	}

	this.render = function()
	{

	}
*/
}
