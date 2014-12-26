var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());
app.get('/', function (req, res) {
 	res.write('<html><body><form method="post" enctype="multipart/form-data" action="/fileUpload">'
    +'<input type="file" name="uploadingFile"><br>'
    +'<input type="submit">'
    +'</form></body></html>');
    res.end();
});

app.post('/fileUpload', function (req, res) {
	var uploadedFile = req.files.uploadingFile;
	var tmpPath = uploadedFile.path;
	var targetPath = './' + uploadedFile.name;
	fs.rename(tmpPath, targetPath, function(err) {
        if (err) throw err;
           	fs.unlink(tmpPath, function() {
            console.log('File Uploaded to ' + targetPath + ' - ' + uploadedFile.size + ' bytes');
        });
    });
    res.send('file upload is done.');
    res.end();
});

app.listen(3000);