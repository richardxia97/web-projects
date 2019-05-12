// ---------------------------------------------------------------
// COMP 2406, Assignment 3
// Richard Xia, 101007519, 18/3/2017
// ---------------------------------------------------------------


/*******************************************************
 Client-side Requirement
 *******************************************************

R2.1) The client-side index.html page should connect a style sheet, the jQuery library, the socket.io library, 
      a .js script file, and a small amount of html elements for targetting. 
	  You should not have your styles or javascript application logic embedded in the index.html page. 
	  The style sheet should provide a background and default font (color and/or font-family) for the page. 
	  You are free to supply any additional styles you wish provided they do not conflict with any of the requirements.

       Upon loading the page, the client script should prompt the user for a name and subsequently send 
	   an introduction event through a socket.io connection to the server. You should handle the case of the 
	   user not providing good information (a default name is sufficient). Additionally, the page should 
	   operate a standard chat program for the user as demonstrated in lecture. Messages typed by the user should 
	   be sent to the server via socket.io, and relayed to all other connected users. 
	   A list of active users should be displayed on the main page. (See Tutorial 7 for details).

R2.2) Upon populating the userlist on the client side, your script should attach an event handler for double 
      click events on every list item. A double click on a user's name should display a prompt for a message. 
	  If the user clicks ok on the prompt, the message should then be sent to the server in an object that 
	  contains two properties: username and message. Where the username is the target of the message 
	  (the double clicked name), and message is the text typed into the prompt. 
	  This information should be sent to the server through the connected socket with the event type 'privateMessage'. 
	  You may design this private messaging system using alternative means beside prompts, 
	  however the system must be separate from the main chat window, and must contain the required functionality.

R2.3) The client script should handle incoming 'privateMessage' events from the server in the following way. 
       Display a prompt to the user containing the name of the person who sent the message and the message itself. 
	   Text entered into the prompt should be sent back to the originating user via the same 'privateMessage' event system. 
	   This should create an ongoing chain of prompts back and forth between two private messaging users. 
	   If a user does not enter text into the prompt, or hits cancel, then no event should be sent to the server.

R2.4) If a user holds down shift while double clicking on a name in the user list, 
      then instead of prompting for a private message, the script should send a 'blockUser' event. 
	  The data for this event should be an object with one property: username, the name of the user to 
	  be blocked (the one that was just double clicked). Future private messages to the current client 
	  from the blocked user should be prevented by the server (see R1.4). 
	  Subsequent shift+double-click events on the same blocked user should toggle unblocking and reblocking 
	  the user (via the server's functionality, see R1.3).

Bonus 2) [1 mark] Blocked users should be styled with a strike-through line in the user list, 

 *******************************************************/

//-----------------------------------------------------
// Handling document readyState and userName prompted
//-----------------------------------------------------
 function onReady(userName){
	
	var socket = io(); //connect to the server that sent this page
	
	socket.on('connect', function(){
		socket.emit("intro", userName);
		//socket.emit("")
	});
	
	$('#inputText').keypress(function(ev){
		if(ev.which===13){
			//send message
			socket.emit("message",$(this).val());
			ev.preventDefault(); //if any
			$("#chatLog").append((new Date()).toLocaleTimeString()+", "+userName+": "+$(this).val()+"\n");
			$(this).val(""); //empty the input
		}
	});
	
	// incoming message
	socket.on("message",function(data){
		if (typeof data === 'string'){
			$("#chatLog").append(data+"\n");
		}	
		else{
			// update the list of connected users
			$("#connectedUsers").empty();
			for (var each in data){
				$("#connectedUsers").append('<li class="chatUser">'+data[each]+"<li>");
			}
		}
	});
	
	$('#contents').on('dblclick', '.chatUser', function() {
		// private message prompt
		var message = prompt("Enter your message xxx: ");
		// send out privateMessage with username and message
		if (!(message === undefined || message === null || message.length <= 0)) {
		  socket.emit("privateMessage",$(this).text(), message);
		}	
	});
	
	$('#contents').on('click', '.chatUser', function(event) {
		// send blockUser with username if shift key is down
		//Bonus 2) Blocked users should be styled with a strike-through line in the user list
		if (event.shiftKey){
			alert("block/unblock user: " + $(this).text());
			socket.emit("blockUser",$(this).text());
			if ($(this).css("text-decoration") == "line-through"){
					$(this).css("text-decoration","none");
				}else {
					$(this).css("text-decoration","line-through");
				}
			}
	});
	socket.on('connect',function(){
      // do nothing
	});
	
	socket.on('disconnect',function(data){
      // do nothing
	});
			
		
}		
