//nodejs存檔範例
var express = require('express'); //4.x
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
var ffmpegToMp4 = require('./ffmpegToMp4');
var app = express();
app.use(bodyParser.json()); //解析
app.use(bodyParser.urlencoded({ extended: true })); //解析
app.use(multer()); //檔案上傳

app.get('/up', function (req, res) {
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
/**
 * 拖曳
 */
app.get('/', function (req, res) {
	fs.readFile("./darp.html", "utf8",function  (err,html) {
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

app.post('/fileUpload_drap', function (req, res) { // 拖曳多檔存檔...
	var uploadedFile = req.files.files;
	var tmpPath = uploadedFile.path;
	var filenameArr = uploadedFile.originalname.split("."),
		fileEnd = filenameArr[filenameArr.length-1], //副檔名
		fileId = Date.now() + ( ( Math.random()*20000 ) >>1 ),
		targetPath = fileId + "." + fileEnd;
	//var targetPath = './' + uploadedFile.originalname; //原檔名
	fs.rename(tmpPath, "upfile/" + targetPath, function(err) { //複製到路徑
        if (err) throw err;
           	fs.unlink(tmpPath, function() {
           		console.log('File Uploaded to ' + targetPath + ' - ' + uploadedFile.size + ' bytes');
        	});
    });
    res.send( targetPath );
    res.end();
    ffmpegToMp4.push( "upfile/"+targetPath ); //丟入轉檔列
});

app.get("*",function  (req, res) {
    var _file = "upfile" + req.originalUrl;
    if(fs.exists(_file, function  (exists) {
    	if(exists){
    		res.download(_file); //檔案下載
    	}else{
    		res.send("沒有這個檔案!");
    		res.end();
    	}
    }));
});
app.listen(3000);
