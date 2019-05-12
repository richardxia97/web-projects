function randEle(list){
	return list[Math.floor(Math.random()*list.length)];
}

function randomColor(){
	var r = Math.floor(Math.random()*256);	
	var g = Math.floor(Math.random()*256);
	var b = Math.floor(Math.random()*256);
	return rgbToHex(r,g,b);
}

function makeColorList(len){
	var res=[];
	for(var i=0;i<len;i++){
		res.push(randomColor());
	}
	return res;
}

function rgbToHex(r,g,b){
	return "#"+byteToHex(r)+byteToHex(g)+byteToHex(b);
}

function byteToHex(n){
	return ""+numToHexChar(Math.floor(n/16))+""+numToHexChar(n%16);
}

function numToHexChar(num){
	switch(num){
		case 10: return "A";
		case 11: return "B";
		case 12: return "C";
		case 13: return "D";
		case 14: return "E";
		case 15: return "F";
		default: return ""+num;
	}
	
}

module.exports.randomColor = randomColor;
module.exports.rgbToHex = rgbToHex;
module.exports.byteToHex = byteToHex;
module.exports.numToHexChar = numToHexChar;
module.exports.makeColorList = makeColorList;

function makeBoard(size){
	//assume size%2==0
	
	items = [];
	for(var i=0;i<(size*size)/2;i++){
		items.push(i);
		items.push(i);
	}

	
	board = [];
	for(var i=0;i<size;i++){
		board[i]=[]
		for(var j=0;j<size;j++){
			var r = (Math.floor(Math.random()*items.length));
			board[i][j]= items.splice(r,1)[0];  //remove item r from the array
			
		}
	}
	return board;
}

module.exports.makeBoard = makeBoard;




//An asynchronous server that serves static files

// load necessary modules
var http = require('http');
var fs = require('fs');
var mime = require('mime-types');
var url = require('url');

//Create a global variable storing all registered clients
var users = {};
var preCard = 0;
var curCard = 0;
const ROOT = "./public_html";

// create http server
var server = http.createServer(handleRequest); 
server.listen(2406);
console.log('Server listening on port 2406');

function handleRequest(req, res) {
	
	//process the request
	console.log(req.method+" request for: "+req.url);
	
	//parse the url
	var urlObj = url.parse(req.url,true);
	var filename = ROOT+urlObj.pathname;
	var colors;
	var randColor;
	var playerBoard;
	console.log("url pathname = ", urlObj.pathname);
	if (urlObj.pathname=== "/memory/intro"){
			var user = urlObj.query.username;
			playerBoard = makeBoard(4);
			var player = {
				board:playerBoard,
				username:user,
				level:0
			}
			users[user] = player;
			console.log("urlobj query works, user = ", user);
			data = JSON.stringify({board:playerBoard});
			respond(200,data);
	}
	else if (urlObj.pathname=== "/memory/card"){
			var user = urlObj.query.username;
			var row = urlObj.query.row;
			var col = urlObj.query.col;
			data = JSON.stringify({value:users[user].board[row][col]});
			respond(200,data);
	}
	else {
	//the callback sequence for static serving...
		fs.stat(filename,function(err, stats){
			if(err){   //try and open the file and handle the error, handle the error
				respondErr(err);
			}else{
				if(stats.isDirectory())	filename+="/index.html";
			
				fs.readFile(filename,"utf8",function(err, data){
					if(err)respondErr(err);
					else respond(200,data);
				});
			}
		});			
	}
	//locally defined helper function
	//serves 404 files 
	function serve404(){
		fs.readFile(ROOT+"/404.html","utf8",function(err,data){ //async
			if(err)respond(500,err.message);
			else respond(404,data);
		});
	}	
	//locally defined helper function
	//responds in error, and outputs to the console
	function respondErr(err){
		console.log("Handling error: ",err);
		if(err.code==="ENOENT"){
			serve404();
		}else{
			respond(500,err.message);
		}
	}
		
	//locally defined helper function
	//sends off the response message
	function respond(code, data){
		// content header
		res.writeHead(code, {'content-type': mime.lookup(filename)|| 'text/html'});
		// write message and signal communication is complete
		res.end(data);
	}	
	
};//end handle request

