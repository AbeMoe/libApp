var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
var express = require('express');
var app = express();
var path = require('path');
var router = express.Router();
var port = process.env.PORT || 1337;
var querystring = require('querystring');
var tools = require(__dirname + '/tools.js'); //These are our helpful tools
app.set('view engine', 'pug')
findRanges = tools.findRanges;



router.get('/user', function (req, res)
{
    res.render('secondFloor.pug');
});
router.post('/user', function (req, res) {
    var code = "";
    var ranges = require('./Ranges/ranges.json'); //Include our JSON file that holds all the ranges
    req.on('data', function (chunk) {
        code += chunk.toString();
    }).on('end', function () {
        temp = undefined;
        userQuery = querystring.parse(code);
        code = userQuery["code"];
        var range = findRanges(code, ranges);
        if (range != undefined)
        {
            var temp = JSON.stringify(range.rectangle);
        }
        res.render('secondFloor.pug', {rect: temp});
    });
});




router.get('/', function (req, res)
{
    res.sendFile(path.join(__dirname + '/admin.html'));

    
});
router.put('/', function (req, res) {
    var body = "";
    req.on('data', function (data)
    {
        body += data;
    });

    req.on('end', function ()
    {

        fs.writeFile(__dirname + '/Ranges/ranges.json', body, function (err)
        {
            if (err) throw err;
            console.log('It\'s saved!');
        });
  
    });
});

app.use(express.static(__dirname + '/View'));
app.use(express.static(__dirname + '/Script'));
app.use(express.static(__dirname + '/Image'));

app.use('/', router);
app.listen(port);