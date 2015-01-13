//nodejs存檔範例
var express = require('express'); //4.x
var bodyParser = require('body-parser');
var multer = require('multer');
//var fs = require('fs');
var fs = require('fs-extra'); 
var ffmpegToMp4 = require('./ffmpegToMp4');
var mp4Stream = require('./mp4_stream')();
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
    if( fileEnd != "mp4" ){
    	ffmpegToMp4.push( "upfile/"+targetPath ); //丟入轉檔列
    }else{
    	//fs.createReadStream("upfile/" + targetPath).pipe(fs.createWriteStream("mp4/" + targetPath));
    	fs.copy("upfile/" + targetPath, "mp4/" + targetPath, function(err) {
		  if (err) return console.error(err)
		  console.log(targetPath + " success!");
		});
    }
});

//下載頁
app.get("/download/:filename",function  (req, res) {
	var _file = "upfile/" + req.params.filename;
    if(fs.exists(_file, function  (exists) {
    	if(exists){
    		fs.readFile("./download.html", "utf8",function  (err,html) {
			// 讀檔...
				if(!err){
					var mp4Id = req.params.filename.split(".")[0];
					var _video = "<video src='/mp4/"+ mp4Id +".mp4' controls >";
					res.send(html.replace(/{Id}/g ,req.params.filename).replace(/{Video}/g ,_video));
					res.end();
				}else{
					res.send("找不到網頁!");
					res.end();
				}
			});
    	}else{
    		res.send("沒有這個檔案!");
    		res.end();
    	}
    }));
});

//mp4串流
app.get("/mp4/:filename", function  (req, res) {
	var _file = "mp4/" + req.params.filename;
	console.log(_file);
	fs.exists(_file,function  (exists) {
		if(exists){
	    	mp4Stream.loadMp4(_file, req, res);
	   	}else{
	   		console.log("no mp4 file!");
	    	mp4Stream.loadMp4("mp4/mv.mp4", req, res);
	    }
	});
});

//檔案下載
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
