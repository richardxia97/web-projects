// ---------------------------------------------------------------
// COMP 2406, Assignment 2
// Richard Xia, 101007519, 4/3/2017
// ---------------------------------------------------------------

//Client-side Requirements

//The client will be a single webpage delivered from the server. 

//R2.1) The client-side index.html page should serve to connect a style sheet (.css file), the jQuery library, a .js script file for the game logic, and a small amount of html elements for targetting. The style sheet should provide a background and default font (color and/or font-family) for the page, as well as the styling requirements specified below (see R2.4 and R2.5). You are free to supply any additional styles you wish provided they do not conflict with any of the requirements.

//R2.2) Upon loading the page, the client script should prompt the user for a name and subsequently send an introductory POST request ("/memory/intro") to the server. The request body should contain JSON data with a single property: the user's name. You should handle the cases of the user not providing good information (a default name is sufficient). The request should be sent using one of jQuery's convenience functions.

//R2.3) The client app should dynamically construct and append to the page, a grid of face down "cards". The image above shows a 4x4 grid. You may hard-code this size or have it dynamically adjusted (see Bonus 1). The cards should be div elements structured as items inside a table (e.g. 4 divs per a table row). Note, at the outset of the game, the cards have no values, these will be filled in by the server (see R2.5,R1.5).

//R2.4) When constructing the card divs be sure to attach the row and column number as data on each element (see MDN and jQuery references for details). Initialize each card with a copy of the click listener function (see R2.5). The cards should be styled via your css file using an appropriate class name. The style should include at minimum a non-white background color (indicating the back of the card), and a width and height. Note: In order to display divs inside a table properly your styling class for the cards should also include the following two properties: display:inline-block; vertical-align:top.

//R2.5) Write a function that will serve as the click handler for any clicked card. The function should determine which div was clicked, and flip it if the provided conditions are met (see R2.6). Revealed (flipped) cards should be styled with a white background and black text using another class name (note, two classes are more specific than one class and will thus win the css specificity comparison). To get the text onto a card, the client must make an XHR GET request using jQuery for the resource "/memory/card". Your request should include the user's name, and the row and column indexes of the clicked card. Information retrieved from the server (simple text of a number) should be appended to the div within a child span element.

//R2.6) The click handler for cards should oversee the matching and victory behaviours of the game as follows. A card will be clicked and the handler function should respond according to a number of conditions:

//The card is currently face up → do nothing
//The card is face down and no other cards are active → reveal the card
//The card is face down and one other card is active → reveal the card and match it to the other active card
//If there's a match, leave both cards face up (but neither are 'active').
//If all cards are matched, then end the game (see R2.7).
//If there's no match, flip both cards back down (after a short pause so the user can see).
//The card is face down and two other cards are active → do nothing
//Note: you will need to keep track of up to two 'active' cards between user clicks. Appropriately named global variables are sufficient for this.

//R2.7) When the game is complete, notify the user of how many guesses (matching attempts not flipped cards) were made. This can be done simply in an alert, or an animated page element, or any other means. Once the notification is complete (pause a moment or wait for the user to click "ok", then a new game should begin. This should be done in a modular fashion, running the same code that was used to start the game the first time (rather than typing everything twice). Note: you should not prompt the user for their name a second time.

//Client-Server Data Exchange

//R3.1) Introduction and Card requests from the client should each be done using one of jQuery's ajax convenience methods.

//R3.2) The introduction request (/memory/intro) should be done using an HTTP POST request with the user data encoded as a JSON string in the message body. The card request (/match/card) should be done using an HTTP GET request, with the user data encoded as a query string attached to the URL. All requests from the user should include a username so that the server can maintain and distinguish between multiple active users.


var user;
var preCard = 0;
var curCard = 0;
var counter = 0;
var numRows = 0;

//---------------------------------------------------
// when page is loaded, prompt user name and send
// post request  to get intro data (card numbers)
// and enter main display
//---------------------------------------------------
function onload(){
    user = prompt("enter the username");
	$.post("memory/intro?username="+user)
		.done(function(data){
		alert(data);
		var parse = JSON.parse(data);
		for (i = 0; i < parse.board.length; i++){
			for (j = 0; j < parse.board[0].length; j++){
			    // td is indexed with id which is used to jquery access later on
				var index = "td"+i+"-"+j;
				$("#gameboard").append("<div data-row = "+i+" data-col = "+j+" id = "+index+" class = tile></div>");
			}
			$("#gameboard").append("<tr>/<tr>");
			counter = 0;
		}
		numRows = parse.board.length;
		displayGame(data);
	});
}

//---------------------------------------------------
// main display game function
// data - card data replied from server
//---------------------------------------------------
function displayGame(data){
	$(document).ready(function(){
	    $('.tile').click(function(){
			var row = $(this).data('row');
			var col = $(this).data('col');
	
			$.ajax({
				method: "GET",
				url: "memory/card",
				data: {'username':user,'row': row,'col':col},
				dataType: 'json'
			}).done(function(data){
				counter++;

				var idx = ""+row+"-"+col;								
				var currentVal = $('#td' + idx).text();	
								
				if (currentVal) {				
					checkFlipedCards(currentVal, row, col);
				}
				else 
				{					                  				
				  $('#td' + idx).text(data.value);
				  				  				  
					if (preCard === 0 && curCard === 0){
						preCard = {row:row,col:col,value:data.value};
						var index2 = ""+preCard.row+"-"+preCard.col;	
						$('#td' + index2).css("background-color","white");						   
						$('#td' + index2).css("color","black");
					}
					else if (curCard === 0){
						curCard = {row:row,col:col,value:data.value};				
					    var index1 = ""+curCard.row+"-"+curCard.col;	
						$('#td' + index1).css("background-color","white");						   
						$('#td' + index1).css("color","black");

					}
					else if(preCard !== 0 && curCard !==0){

					// if it is the 3rd card other than preCard and curCard, check whether preCard and curCard are matched.
					// if matched, both cards are flipped forever, 
					// if not matched, they are flipped back and could be flipped again.

						var index1 = ""+curCard.row+"-"+curCard.col;						                         
						var index2 = ""+preCard.row+"-"+preCard.col;						                         
					
						if (preCard.value !== curCard.value) {				

							// CASE 1: preCard and curCard are not matched
					        //         they are flipped back and could be flipped again.
						
							$('#td' + index1).empty();
							$('#td' + index2).empty();					   																		
							
						    $('#td' + index1).css("background-color","blue");
						    $('#td' + index1).css("color","white");
																			      
						    $('#td' + index2).css("background-color","blue");
						    $('#td' + index2).css("color","white");
							
							$('#td' + index1).text("");					   																		
							$('#td' + index2).text("");					 

						   // flip number for the 3rd card
						   if (!((preCard.row == row && preCard.col == col) ||
						       (curCard.row == row && curCard.col == col))) {	
							 var index3 = ""+row+"-"+col;	   
						     $('#td' + index3).css("background-color","white");
						     $('#td' + index3).css("color","black");		 
							 curCard = 0;
							 preCard = {row:row,col:col,value:data.value};							
                           }							   							

						} else {
						
						   // CASE 2: preCard and curCard are matched
					       //         they are kept to be flipped forever

						   var v1 = $('#td' + index1).text();						   
						   $('#td' +index1).empty();
						   $('#td' + index1).css("background-color","white");						   
						   $('#td' + index1).css("color","black");
						   $('#td' + index1).text(v1);
						   
						   var v2 = $('#td' + index2).text();
						   $('#td' +index2).empty();
						   $('#td' + index2).css("background-color","white");
						   $('#td' + index2).css("color","black");		
						   $('#td' + index2).text(v2);
						   
						   var matchOne = false;
						   if ((preCard.row == row && preCard.col == col) ||
						       (curCard.row == row && curCard.col == col) ) {							   																				
						     matchOne = true;
						   }

						      curCard = 0;
						      preCard = 0;			
                              // check game over									  
  			                  if (checkGameOver() === true)
							  {
							    alert("Game Over. Total number of attempts = "+counter);
							  }				
							  if (matchOne === false)
							  {
							    preCard = {row:row,col:col,value:data.value};	
							  }							  
						}
					
					}

				}
				
			});			
    	});
	});
}


//---------------------------------------------------
// check whether game is over
//
// return: true if game is over, false otherwise
//---------------------------------------------------
function checkGameOver() {

   // if any cards are still in progress of checking, continue game   
   if (preCard !== 0 || curCard !== 0)
   {
     return false;
   }

   // if any card does not have number displayed, it means never flip or no match in previous run, continue game   
   for (i = 0; i < numRows; i++){
		for (j = 0; j < numRows; j++){
			var index = ""+i+"-"+j;	
			if ($('#td' + index).text() && ($('#td' + index).text() != ""))
			{
			continue;
			}
		   return false;			
		}			
	}  
	
	// all cards are flipped, game over
	return true;  
}


//---------------------------------------------------
// check flipped cards when card is clicked with valid text display
//
// if it is the 3rd card other than preCard and curCard, check whether preCard and curCard are matched.
// if matched, both cards are flipped forever, 
// if not matched, they are flipped back and could be flipped again.
//
// return: N/A
//---------------------------------------------------
function checkFlipedCards(currentVal, row, col) {
                   if (preCard !== 0 && curCard === 0){					
				        if (!currentVal) {
				        preCard = {row:row,col:col,value:data.value};
						}
						var index2 = ""+preCard.row+"-"+preCard.col;	
						$('#td' + index2).css("background-color","white");						   
						$('#td' + index2).css("color","black");
					}
					else if (curCard !== 0 && preCard === 0){
					     if (!currentVal) {
						   curCard = {row:row,col:col,value:data.value};				
					     }
					    var index1 = ""+curCard.row+"-"+curCard.col;	
						$('#td' + index1).css("background-color","white");						   
						$('#td' + index1).css("color","black");

					} else if(preCard !== 0 && curCard !==0){
					
					// if it is the 3rd card other than preCard and curCard, check whether preCard and curCard are matched.
					// if matched, both cards are flipped forever, 
					// if not matched, they are flipped back and could be flipped again.


						var index1 = ""+curCard.row+"-"+curCard.col;						                         
						var index2 = ""+preCard.row+"-"+preCard.col;						                         
					
						if (preCard.value !== curCard.value) {						  

							// CASE 1: preCard and curCard are not matched
					        //         they are flipped back and could be flipped again.

							$('#td' + index1).empty();
							$('#td' + index2).empty();					   																									
						    $('#td' + index1).css("background-color","blue");
						    $('#td' + index1).css("color","white");																			      
						    $('#td' + index2).css("background-color","blue");
						    $('#td' + index2).css("color","white");							
							$('#td' + index1).text("");					   																		
							$('#td' + index2).text("");					   																		
							
						   // flip number for the 3rd card
						   if (!((preCard.row == row && preCard.col == col) ||
						       (curCard.row == row && curCard.col == col))) {	
							 var index3 = ""+row+"-"+col;	   
						     $('#td' + index3).css("background-color","white");
						     $('#td' + index3).css("color","black");	
                             if (currentVal) {                            							 
							 $('#td' + index3).text(currentVal);		 
							 }
							 curCard = 0;
							 preCard = {row:row,col:col,value:data.value};						
                           }							   

							
						} else {

						   // CASE 2: preCard and curCard are matched
					       //         they are kept to be flipped forever

						   var v1 = $('#td' + index1).text();						   
						   $('#td' +index1).empty();						   
						   $('#td' + index1).css("background-color","white");						   
						   $('#td' + index1).css("color","black");
						   $('#td' + index1).text(v1);
						   
						   var v2 = $('#td' + index2).text();
						   $('#td' +index2).empty();
						   $('#td' + index2).css("background-color","white");
						   $('#td' + index2).css("color","black");		
						   $('#td' + index2).text(v2);
						   
						   // if matches to one of the saved cards, just clean up
						   var matchOne = false;
						   if ((preCard.row == row && preCard.col == col) ||
						       (curCard.row == row && curCard.col == col) ) {							   																				
						     matchOne = true;
						   }

						   curCard = 0;
						   preCard = 0;			
                           // check game over						   
  			               if (checkGameOver() === true)
						   {
							  alert("Game Over. Total number of attempts = "+counter);
						   }				
						   if (matchOne === false)
						   {
							  preCard = {row:row,col:col,value:data.value};	
						   }							                             
						}
					
					}				  
}
