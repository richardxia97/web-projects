
// ---------------------------------------------------------------
// COMP 2406, Assignment 1
// Richard Xia, 101007519, 14/2/2017
// ---------------------------------------------------------------

// server listens on the provided port and responds with static files
//
// - Open and read files on the server.
// - Send GET requests from client to server, and extract the response data.
// - Receive GET requests from the client and formulate a response.
// - Construct server routes and parse URL query strings.
// - Send JSON strings between browser and server.
// - Convert JSON strings to javascript objects.
// - Construct form elements with dynamically determined contents.

// The server code should use only javascript and node.js with built-in modules 

//R1.1) The server should be hosted on port 2406 and reachable from a browser via the following request: http://localhost:2406/.
//R1.2) The server should respond to GET requests for html files by retrieving the page or returning 404 if the page doesn't exist. 
//     That is, it should function as a static server for any existing html & css files. To initiate the application, 
//     a user should request the root directory of the page and be served with the index.html of the app.
//R1.3) The server should have a directory of superhero files stored as .json objects. A GET request for the route /allHeroes
//     should be handled by a separate route from the static files, and return a JSON object containing one property:
//     an array of all filenames in that directory.

//The hero objects should have (at minimum) the following properties:
//A name (superhero name)
//An alter ego (real name)
//An jurisdiction
//An array of super powers
//A dictionary (object) of colour styles

//R1.4) The server should contain a route for GET requests of the form /hero?name=heroname, 
// and should respond with the appropriate JSON string, retrieved from the file heroname.json.

// load http module
var http = require('http');
var fs = require('fs');
var mime = require('mime-types');
var url = require('url');
const ROOT = "./public";						 

// create http server
var server = http.createServer(handleRequest);
server.listen(2406);

console.log('Server listening on port 2406');

// Handle text request and response
// [input] req: text/json request from client
// [output] resp: text/json response to client

function handleRequest(req, res) {
	
	var urlObj = url.parse(req.url,true);
	
	//process the request
	console.log(req.method+" request for "+req.url);
	console.log("urlPathname: ",urlObj.pathname);
	console.log("urlQuery: ",urlObj.query);
	
	
	var code=500;
	var data = "";
	var filename = "";
	var jsonFileName = "";
	var jsonFileDirName = "";

    var myObj, myJSON, text, obj;	
   
	if(urlObj.pathname==="/hero"){
		code = 200;
		var username = urlObj.query.username;
		if (username == "allHeroes")
		{
		    // query for allHeroes
		    // returns array of heroes
			jsonFileDirName = ROOT+"/heroes/";
			var files = fs.readdirSync(jsonFileDirName);
			data = JSON.stringify(files);
		}
		else
		{
		    // for request to a specific hero
		    // deserialize from file to a string representing json object 
			jsonFileDirName = ROOT+"/heroes/";
			var files = fs.readdirSync(jsonFileDirName);
			if ( files.indexOf(username) > -1)
			{
			   jsonFileName = jsonFileDirName + username;
			   var text = fs.readFileSync(jsonFileName);
			   data = text;				   
			   console.log("send data for hero="+username+":"+data);  
			} else  {
			   console.log("ERROR hero does not exist:"+username);        
			}			
		}
		filename = ".json"; 			
	}else{
		//static route
		filename = ROOT+req.url;				
		if(fs.existsSync(filename)){		
			var stats = fs.statSync(filename);
			if(stats.isDirectory()){
				filename += "/index.html";
			}
			data = fs.readFileSync(filename);
			code = 200;
			
		}else{
			console.log("File not found");
			code = 404;
			data = fs.readFileSync(ROOT+"/404.html");
		}
	}
	
    if (req.method == 'GET') {       
	    console.log('RECEIVED GET request:\n'+ req);
    }
  
	// content header
	res.writeHead(code, {'content-type': mime.lookup(filename)|| 'text/html'});
	// write message and signal communication is complete
	res.end(data);
};
