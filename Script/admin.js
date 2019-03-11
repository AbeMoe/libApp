window.onload = function(e){
//-----------------------------------------------------------------------------------START OF MAP SETUP
	var map = L.map('mapid', {
			crs: L.CRS.Simple,
			zoomControl:false
		});   
	var maxHeight = 500; //sets the boundaries of the leaflet object
	var maxWidth = 500; 
	var bounds = [[0,0], [maxHeight,maxWidth]];
	L.imageOverlay('floor2.jpg', bounds).addTo(map); //sets what image the leaflet map uses

	map.fitBounds(bounds);
	
    var ranges = [];
    var rectArray = [];

//END OF MAP SETUP----------------------------------------------------------START OF LISTENER VARIABLES
    var rangeList = document.getElementById('rangeList') // The visual representation of ranges in the array
	var start_coords, end_coords; // starting and ending coordinates of a range 
	var temp_rect //Holds the rectangle that is drawn from the coordinates
//END OF LISTENER VARIABLES------------------------------------------START OF CLASS LIBRARY 


	
//General note to the reader:
//While I do say that there are "classes" inside of this script
//they are defacto NOT classes. They do NOT inherit like classes but 
//are only meant to handle stringification and abstraction of objects
	
	
	
	//Name: callCode, 
	//Purpose: Constructor for callCode class
	//Contents
    //         full=The entire raw callcode (for search purposes)
	//         let1= The first set of letters in the call code
	//		   num1= The first set of numbers in the call code
	//		   let2= The second set of letters in the call code
	//         num2= The second set of numbers in the call code
    //         year= String consisting of the books year of publication
    class call_code {
        constructor(code) {
            this.full = code;
            this.let1 = this.num1 =
                this.let2 = this.num2 =
                this.year = "";
            var i = 0;
            while (/[a-zA-Z]/.test(code[i]) && code[i] != undefined) {
                this.let1 += code[i].toUpperCase();
                i++;
            }
            while (/[0-9]/.test(code[i]) && code[i] != undefined) {
                this.num1 += code[i]
                i++;
                if (code[i] == '.' && /[0-9]/.test(code[i + 1])) {
                    this.num1 += code[i];
                    i++;
                }
            }
            if (code[i] == '.')
                i++;
            while (/[a-zA-Z]/.test(code[i]) && code[i] != undefined) {
                this.let2 += code[i].toUpperCase();
                i++;
            }
            while (/[0-9]/.test(code[i]) && code[i] != undefined) {
                this.num2 += code[i]
                i++;
            }

        }

    }
	//Name:book_range
    //Contents:
    //         lower: THe lower end of the range's books
    //         upper: the upper end of the range's books
    //         rectangle:The Leaflet polygon we show to the User 
    class book_range {
        constructor(rectangle, lower, upper) {
            this.rectangle = rectangle
            if (typeof lower == "string")
                this.lower = new call_code(lower);
            else if (lower instanceof call_code)
                this.lower = lower;
            if (typeof upper == "string")
                this.upper = new call_code(upper);
            else if (upper instanceof call_code)
                this.upper = upper;
        }
    }


//END OF CLASS LIBRARY----------------------------------------------START OF CALLBACK FUNCTIONS

    /*Callback Function Contents:
        1.startingCoords
        2.drawRect
        3.updateRangeList
        4.addRange
        5.removeRange
        6.exportRanges
    */
    //Name: startingCoords, listener function for a click on the map object
    //Purpose: removes the existing temporary rectangle and gets the starting coordinates of the new one
	function startingCoords(ev)
    {
        if (event.button == 2) {
            if (temp_rect != undefined)
                { map.removeLayer(temp_rect); }
            map.dragging.disable();
            start_coords = map.mouseEventToLatLng(ev.originalEvent);
        }
	}
	
	//Name: drawRect, listens for the end of a click on the map object
	//Purpose: draws the temporary rectangle to screen.
	function drawRect(ev)
    {
        if (event.button == 2) // if it is a click of the left mouse button
        {
            end_coords = map.mouseEventToLatLng(ev.originalEvent); //returns the mouse clicks geo coordinates
            temp_rect = new L.polygon(
                [
                    [start_coords.lat, start_coords.lng],
                    [start_coords.lat, end_coords.lng],
                    [end_coords.lat, end_coords.lng],
                    [end_coords.lat, start_coords.lng],
                ]);
            temp_rect.addTo(map)
            map.dragging.enable();
        }   
    }

    //Name:updateRangeList, listener callback for "rangeList" DOM object
    //Purpose: Removes all enttites from the "rangeList" object 
    //         then repopulates it with all of the contents of "range"
    function updateRangeList(ev)
    {

        staticLength = rangeList.children.length;
        //Removes all the old DOM elements
        for (var i = 0; i < staticLength; i++)
            {
                rangeList.removeChild(rangeList.children[0]);
            }
      
        for (range in ranges)
        {
            var listEntry = document.createElement("DIV");
            var descriptor = document.createElement("LABEL");
            var selector = document.createElement("INPUT");
            listEntry.setAttribute("class", "radio");
            selector.setAttribute("type", "radio");
            selector.setAttribute("name", "listEntry");
            selector.setAttribute("value", range);
            descriptor.appendChild(selector);
            descriptor.innerHTML += "lower:" + ranges[range].lower.full + " upper:" + ranges[range].upper.full;

            listEntry.appendChild(descriptor);
            rangeList.appendChild(listEntry);
        }
    }


    //Name: addRange, listens for click of "add range" button
    //Purpose: adds the last drawn rectangle in the leaflet map
    //         to the set of all ranges as a side effect.
	function addRange()
    {
        //if temp_rect exists()
		if(temp_rect != undefined)
        {
			map.removeLayer(temp_rect); // removes the last rectangle 
			var codes = document.forms[0]
            var perm_rect = new L.polygon(temp_rect.getLatLngs());
            perm_rect.addTo(map)
            rectArray.push(perm_rect); // keeps track of what rectangles are on the map for deletion purposes 
            geo = perm_rect.toGeoJSON();//We convert the polygon to GeoJSON for storage purposes.
            new_range = new book_range(geo, codes.lower.value, codes.upper.value);
			ranges.push(new_range)
            temp_rect = undefined;
            updateRangeList();
		}
    }
    //Name: removeRange, listener callback
    //Purpose: removes range from map at a given radio checkbox index
    //side effect: removes a range from both the ranges and 
    //             our rectangle Array.
    function removeRange()
    {
        var toRemove = document.querySelector('input[name="listEntry"]:checked').value;
        map.removeLayer(rectArray[toRemove]);
        console.log(rectArray[toRemove]);
        rectArray.splice(toRemove, 1);
        ranges.splice(toRemove,1);
        updateRangeList();
    }

    //Name:exportRanges
    //Creates a POST request to the server which saves the object 
    //as a New JSON file with the host
	function exportRanges()
	{
        var Http = new XMLHttpRequest();
        Http.open("PUT", '/', true);
        Http.send(JSON.stringify(ranges));
	}
//END OF HELPER FUNCTION LIBRARY---------------------------------------START OF EVENT LISTENERS

    document.getElementById('mapid').oncontextmenu = function () {return false;};
	map.on('mousedown', startingCoords,false);
	map.on('mouseup', drawRect,false);
	document.getElementById('addRange').addEventListener("click", addRange);
    document.getElementById('exportJSON').addEventListener("click", exportRanges);
    document.getElementById('removeRange').addEventListener("click", removeRange);
} 