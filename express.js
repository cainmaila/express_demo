//nodejs存檔範例
var express = require('express'); //4.x
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');

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
    res.send('file upload is done. cain!!');
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

//駐列表===============================================================

var list = [],
	isbusy = false;
function pushFile (_path) {
	list.push(_path);
	if(!isbusy){
		runFile();
	}
}
function  runFile() {
	isbusy = true;
	var _filename = list.shift();
	ffmpegToMp4( _filename ,error ,progress ,end );
	function error (_message) {
		// body...
		nextFile();
	}
	function progress (_progressPa) {
		// body...
	}
	function end (_mp4Name) {
		// body...
		nextFile();
	}
}
function nextFile () {
	if(list.length>0){
		runFile();
	}else{
		isbusy = false;
	}
}

//轉檔================================================================
var ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath("D:/ffmpeg/bin/ffmpeg.exe"); 
ffmpeg.setFfprobePath("D:/ffmpeg/bin/ffprobe.exe"); 
function ffmpegToMp4 (_path , errfun_ , progressfun_ , endfun_ ) {
	var command = new ffmpeg(_path)
				.inputFormat('mp4')
				.on('error', function(err) {
				    //console.log('轉檔錯誤: ' + err.message);
				    errfun_( err.message );
				  })
				.on('progress', function(progress) {
				    //console.log('轉檔進度 : ' + progress.percent + '% done');
				    progressfun_( progress.percent );
				  })
				.on("end",function  () {
					endfun_( fileId + '.mp4' );
				})
				.save( fileId + '.mp4' ),
	fileId = Date.now() + ( ( Math.random()*20000 ) >>1 );
}