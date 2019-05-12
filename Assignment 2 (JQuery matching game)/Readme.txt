
// ---------------------------------------------------------------
// COMP 2406, Assignment 2
// Richard Xia, 101007519, 4/3/2017
// ---------------------------------------------------------------

Usage:
The server should be started with node.js:
>node server.js

The server is hosted on port 2406 and reachable from a browser via the following request: http://localhost:2406/.

- Enter user name under prompt. Card data will be requested with POST, and card data for the user will be replied from server. 
- Click a card, and the card will be flipped with card number.
- Then click another card, and the card will be flipped with card number as well. 
- If the numbers are matched, both cards are kept as flipped forever. 
- Continue to flip the card until all cards are flipped.
- Summary of number of attempts will be prompted when game is over.

Known Issues:
Text display on div overlays. I could not figure out how to fix it.
The card data is available in alert box after user is prompted. The data could be used for verification purpose.
Sorry for text overlay.

Test under:
Windows, Firefox and node.js