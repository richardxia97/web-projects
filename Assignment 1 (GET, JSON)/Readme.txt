
// ---------------------------------------------------------------
// COMP 2406, Assignment 1
// Richard Xia, 101007519, 14/2/2017
// ---------------------------------------------------------------

Usage:
The server should be started with node.js:
>node server.js

The server is hosted on port 2406 and reachable from a browser via the following request: http://localhost:2406/.

Select a hero from drop down list, then click "View" button to view Hero's attributes:
- name (superhero name)
- alter ego (real name)
- jurisdiction
- an array of super powers
- a dictionary (object) of colour styles which are applied dynamically


//------- Implementation details -------
server listens on the provided port and responds with static files

- Open and read files on the server.
- Send GET requests from client to server, and extract the response data.
- Receive GET requests from the client and formulate a response.
- Construct server routes and parse URL query strings.
- Send JSON strings between browser and server.
- Convert JSON strings to javascript objects.
- Construct form elements with dynamically determined contents.
