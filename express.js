//nodejs存檔範例
var express = require('express'); //4.x
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');

var app = express();
app.use(bodyParser.json()); //解析
app.use(bodyParser.urlencoded({ extended: true })); //解析
app.use(multer()); //檔案上傳

app.get('/', function (req, res) {
	fs.readFile("./view.html", "utf8",function  (err,html) {
		// 讀檔...
		if(!err){
			res.send(html);
			res.end();
		}else{
			res.send("找不到網頁!");
			res.end();
		}
	});
});

app.post('/fileUpload', function (req, res) { // 存檔...
	var uploadedFile = req.files.uploadingFile;
	var tmpPath = uploadedFile.path;
	//var targetPath = './' + uploadedFile.name; //tmp檔名
	var targetPath = './' + uploadedFile.originalname; //原檔名
	fs.rename(tmpPath, targetPath, function(err) { //複製到路徑
        if (err) throw err;
           	fs.unlink(tmpPath, function() {
            console.log('File Uploaded to ' + targetPath + ' - ' + uploadedFile.size + ' bytes');
        });
    });
    res.send('file upload is done.');
    res.end();
});

app.listen(3000);