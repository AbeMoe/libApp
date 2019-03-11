window.onload = function (e) {
    console.log("hi!");
    var maxHeight = 500;
    var maxWidth = 500;
    var bounds = [[0, 0], [maxHeight, maxWidth]];
    console.log("hello!");
    var map = L.map('libraymaps', {
        crs: L.CRS.Simple,
        zoomControl: false,

    });
    L.imageOverlay('floor2.jpg', bounds).addTo(map);

    map.fitBounds(bounds);
    if (rect != undefined)
    {
        map.clear;
 
        L.geoJSON().addTo(map).addData(rect);
    }
 
};

