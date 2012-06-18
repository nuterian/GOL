var width = 1100;
var height = 450;
var container, stats;
var canvas, camera, scene, projector, renderer;
var particleMaterial;

var period = 1000/10;

var cells = new Array();
var rows = 0, columns = 0;

window.onload = function(){
	initScene();
	init();
	setInterval(runLoop, period);
}

function initScene(){
	$container = $("#mainCanvas");

	camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, -2000, 1000 );
	camera.position.set(0,0,100);

	scene = new THREE.Scene();
	scene.add( camera );

	projector = new THREE.Projector();

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( width, height);

	canvas = renderer.domElement;
	canvas.onmousemove = onMouseDown;

	$container.append( canvas );
}

function init() {
	
	console.log(toWorldPos(0, 0));
	console.log(toWorldPos(width/2, height/2));

	var scale = 20;
	var i, j;

	cells = new Array(Math.ceil(height/scale));

	for (  i = 0; i <= height; i += scale )
	{
		cells[i/scale] = new Array(Math.ceil(width/ scale));

		for ( j = 0; j <= width; j += scale ) 
		{					
			var object = drawSquare(scale);	
			var pos = toWorldPos(j, i);	
			object.position.set(pos.x, pos.y ,0);	
			
			var x = i/scale, y = j/scale;
			var cell = new Cell(object, x, y);
			cells[x][y] = cell;
			object.cell = cell;

			scene.add(object);

		}			
	}

	rows = i/scale;
	columns = j/scale;

}

function Cell(mesh, i, j)
{
	this.mesh = mesh;
	this.i = i;
	this.j = j;

	this.isAlive = false;

	this.revive = function(){
		this.isAlive = true;
	}

	this.kill = function(){
		this.isAlive = false;
	}
}

drawSquare = function(scale){

	scale = scale || 10; //Default scale of 10 units.

	var geometry = new THREE.CubeGeometry( scale, scale, scale);

	/*
	var geometry = new THREE.Geometry();
	geometry.vertices.push( new THREE.Vector3( -scale,  scale, 0 ) );
	geometry.vertices.push( new THREE.Vector3( -scale, -scale, 0 ) );
	geometry.vertices.push( new THREE.Vector3(  scale, -scale, 0 ) );
	geometry.vertices.push( new THREE.Vector3(  scale,  scale, 0 ) );

	geometry.faces.push( new THREE.Face4( 0, 1, 2, 3 ) );
	//geometry.faces.push( new THREE.Face3( 2, 3, 0 ) );
	geometry.computeFaceNormals();
	*/

	return new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0}));				
}

onMouseDown = function( event ) {

	event.preventDefault();

	//var x = event.clientX - $(canvas).offset().left;
	//var y = event.clientY - $(canvas).offset().top;

	var object = getObjectAtPos(event.clientX, event.clientY);
	//var object = getObjectAtPos(x, y);

	if ( object ) {
		//object.material.color.setHex(0x000000);
		object.cell.revive();
		object.cell.mesh.material.opacity = 1;
		object.cell.isAlive = true;
		console.log(object.cell);
		//console.log(object.cell);
		//console.log('Hovered over ('+object.cell.i+', '+object.cell.j+')');
	}	
}

toScreenPos = function(positionVector){
	var pos = positionVector.clone();

	projector.projectVector(pos, camera);

	return {
		x: (  pos.x + 1 ) * width / 2 + $(canvas).offset().left + window.pageXOffset,
		y: ( -pos.y + 1 ) * height / 2 + $(canvas).offset().top + window.pageYOffset
	};
}

toWorldPos = function(x, y){

	// Convert to Normalized Device Cooordinates (NDC)
	x =  ( x / width ) * 2 - 1;
	y = -( y / height ) * 2 + 1;	

	var vector = new THREE.Vector3( x, y, -1 );
	projector.unprojectVector( vector, camera );

	return vector;
}

getObjectAtPos = function(x, y){

	x -= $(canvas).offset().left - window.pageXOffset;
	y -= $(canvas).offset().top - window.pageYOffset;

	x =  ( x / width ) * 2 - 1;
	y = -( y / height ) * 2 + 1;	

	var vecOrigin = new THREE.Vector3( x, y,  -1 );
	var vecTarget = new THREE.Vector3( x, y,  1 );

	projector.unprojectVector( vecOrigin, camera );
	projector.unprojectVector( vecTarget, camera );

	vecTarget.subSelf( vecOrigin ).normalize();

	var ray = new THREE.Ray(vecOrigin, vecTarget);
	var intersects = ray.intersectObjects( scene.children );

	if(intersects.length > 0)
		return intersects[0].object;
	return undefined;
}

function runLoop() {

	update();
	render();
}

function update() {

	for(var i=0; i<rows; i++){

		for(var j=0; j<columns; j++){

			var cell = cells[i][j];
			var aliveNeighbours = 0;

			var upper = (i == 0) ? rows - 1: i - 1;
			var lower = (i == rows - 1) ? 0 : i + 1;
			var left = (j == 0) ? columns - 1 : j - 1;
			var right = (j == columns - 1) ? 0 : j + 1;

			if(cells[upper][left].isAlive) aliveNeighbours++;
			if(cells[i][left].isAlive) aliveNeighbours++;
			if(cells[lower][left].isAlive) aliveNeighbours++;

			if(cells[upper][j].isAlive) aliveNeighbours++;
			if(cells[lower][j].isAlive) aliveNeighbours++;

			if(cells[upper][right].isAlive) aliveNeighbours++;
			if(cells[i][right].isAlive) aliveNeighbours++;
			if(cells[lower][right].isAlive) aliveNeighbours++;

			if(aliveNeighbours > 0){
				console.log('Alive Neighbours: '+aliveNeighbours);
			}


			if(cell.isAlive){

				if(aliveNeighbours < 2 || aliveNeighbours > 3){
					cell.kill();
				}					
			}
			else{

				if(aliveNeighbours == 3)
					cell.revive();
			}

			if(cell.isAlive){

				cell.mesh.material.opacity = 1;	
				console.log('Setting Alive');
			}					
			else{
				cell.mesh.material.opacity = 0;	
			}

		}
	}
}

function render() {

	camera.lookAt( scene.position );
	renderer.render( scene, camera );
}


