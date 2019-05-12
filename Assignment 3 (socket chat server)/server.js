// ---------------------------------------------------------------
// COMP 2406, Assignment 3
// Richard Xia, 101007519, 18/3/2017
// ---------------------------------------------------------------


/*******************************************************
 Server-side Requirement
 *******************************************************
R1.1) The server should support standard requests for static files (note, the provided code base does not do this). 
      Requests for directories (including the root directory) should be served with index.html. 
	  A client should initiate their chat application by requesting the root directory from your server.

      In addition, your server should function as a chat relay using socket.io-based communication. 
	  Specifically, the server should handle intro and disconnect messages from the user by creating, 
	  populating, and managing a list of active users, and messages sent from one client should be broadcast 
	  to all other clients. For details on these steps see Tutorial 7. You may assume unique usernames for this assignment.

R1.2) The server should handle socket events of type "privateMessage". 
      Such events will be given an object as a data argument that contains two properties: 
	  username and message (both strings). The server should relay the private message to only the user 
	  that matches the string. This should be done using a "privateMessage" event as well.

R1.3) The server should handle socket events of type "blockUser". Such events will be given an object 
      as data that contains one property: username. The server should handle this event by appending the 
	  provided username to a list of blocked users for the requesting client. If the user is already blocked, 
	  then the user should handle the event by removing the user from the blocked list. 
	  In both cases, the server should send a standard message (like the welcome message) 
	  back to the requesting client, to confirm that the requested user has been blocked/unblocked.

R1.4) The server should make use of the clients' blocked users list when that client is to received a private message. 
      Only private messages from users not appearing in the client's blocked users list should be set. 
	  That is, the server should handle the blocking of private messages from unwanted users. 
	  Note: this blocking behaviour only applies to private messages, 
	  blocked users may still be visible in the main chat window.
	  
Bonus 1) [2 marks] Blocked users no longer appear in the main chat window. 
      In addition to filtering blocked users from the private message system, 
	  the server will also prevent messages sent by a blocked user from being delivered
      to any socket that has blocked them.

Bonus 2) [1 mark] Blocked users should be styled with a strike-through line in the user list, 
      via the attached css file. This styling should persist so long as the client does (or until the target is unblocked).


	  
***************************************************/

/*SocketIO based chat room.*/

var http = require('http').createServer(handler);
var io = require('socket.io')(http);
var fs = require('fs');
var url = require('url');
var mime = require('mime-types');

http.listen(2406);

console.log("Chat server listening on port 2406");

const ROOT = "./public_html";

//-----------------------------------------------------
// Handling request
//-----------------------------------------------------
function handler(req,res){
		
	//process the request
	console.log(req.method+" request for: "+req.url);
	
	var urlObj = url.parse(req.url,true);
	var filename = ROOT+urlObj.pathname;
	
	// support standard requests for static files
	fs.stat(filename,function(err, stats){
		if (fs.existsSync(filename))
		{
			if (urlObj.pathname === "/")
			{
				filename+="/index.html";
			}		
		}
		fs.readFile(filename, function(err,data){
			if(err){   //try and open the file and handle the error, handle the error
				respondErr(err);
			}
			else{
				fs.readFile(filename,"utf8",function(err, data){
					if(err){
						respondErr(err);
					}
					else respond(200,data);
				});
			}
		});
	});	
			
	
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
}; //end handle request

var clients = [];
var users = [];
var blockedUsers = []; // list of [client-blockUse] pair

function getUserList() {
	var ret = [];
	for (var i=0;i<clients.length;i++){
		ret.push(clients[i].username);
	}
	return ret;
}

function updateList(user){
	var users = getUserList();
	console.log("userList = " + users);
	for (var i = 0; i < users.length; i++){
		if (users[i] === user){
			clients.splice(i,1);
		}
	}
}

//-----------------------------------------------------
// Handling socket connection
//-----------------------------------------------------
io.on("connection", function(socket){
	console.log("Got a connection");
	var username;
	socket.on("intro",function(data){
		socket.username=data;
		socket.broadcast.emit("message", timestamp()+": "+socket.username+" has entered the chatroom.");
		socket.emit("message","Welcome, "+data+".");
		clients[clients.length] = {username:socket.username};
		users[socket.username] = socket.id;
		//console.log("clients = " + getUserList());
		socket.broadcast.emit("message",getUserList());
		socket.emit("message",getUserList());
	});
		
	// handle incoming chat broadcast message
	socket.on("message", function(data){
		console.log("User: " +socket.username + " sent message: "+data);
		var message = "";
		var userList = getUserList();
		for (var i = 0; i < userList.length; i++){
			message += userList[i];
		}
		message += "blockedUsers:";
		for (var i = 0; i < blockedUsers.length; i++){
			message += blockedUsers[i];
		}
		//console.log("add " + message);
		//socket.broadcast.emit("message",message + timestamp()+", "+socket.username+": "+data);
		socket.broadcast.emit("message", timestamp()+", "+socket.username+": "+data);
	});

	// handle disconnection
	socket.on("disconnect", function(userName){
		console.log(socket.username + " disconnected");
		updateList(socket.username);
		//console.log("clients = " + getUserList());
		io.emit("message", timestamp()+": "+socket.username+" disconnected.");
		socket.broadcast.emit("message", getUserList());
	});
	socket.on("blockUser",function(data){
		var identifier = socket.username+"-"+data;
		var blockIndex = blockedUsers.indexOf(identifier);
		//console.log("blockIndex = " + blockIndex+", identifier="+identifier);
		if (blockIndex != -1){
			blockedUsers.splice(blockIndex,1);
			console.log("user "+data+" unblocked by " + socket.username);
		}
		else {
			blockedUsers[blockedUsers.length] = identifier;
			console.log(data + " blocked by " + socket.username);
		}
	});
	socket.on("privateMessage",function(username,message){
	   // Bonus: the server will also prevent messages sent by a blocked user 
	   // from being delivered to any socket that has blocked them.
		var sendMessage = true;
		console.log("got pm to user=[" + username +"], message=["+ message+"]");
		console.log("blocked num of users = " + blockedUsers.length);
		for (var i = 0 ; i < blockedUsers.length; i++){
		    var identifier =socket.username+"-"+username;
			console.log("blockedUsers["+i+"]="+blockedUsers[i]+", identifier="+identifier);
			if (identifier === blockedUsers[i]){
				sendMessage = false;
			}
		}
		if (sendMessage){
			io.to(users[username]).emit('message',timestamp()+", "+socket.username+": "+message);
		}
	});
	socket.on("testthis",function(){
		console.log("it worked!");
	});
	socket.on('sendName',function(data){
		console.log("name = " + data);
	});
});

function timestamp(){
	return new Date().toLocaleTimeString();
}