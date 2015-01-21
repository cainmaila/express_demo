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
	fs.readFile("./darp_ui.html", "utf8",function  (err,html) {
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
					//var _video = "<video src='/mp4/"+ mp4Id +".mp4' controls >";
					//res.send(html.replace(/{Id}/g ,req.params.filename).replace(/{Video}/g ,_video));
					res.send(html.replace(/{Id}/g ,req.params.filename).replace(/{IdMp4}/g ,mp4Id+".mp4").replace(/{IdHead}/g ,mp4Id));
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
	var _file = "upfile/" + req.params.filename;
	console.log(_file);
	fs.exists(_file,function  (exists) {
		if(exists){
	    	mp4Stream.loadMp4(_file, req, res);
	   	}else{
	   		console.log("no mp4 file!");
	    	mp4Stream.loadMp4("upfile/mv.mp4", req, res);
	    }
	});
});

//是否有檔案
app.get("/exists/:flie", function  (req, res) {
	var _file = "upfile/" + req.params.flie;
	fs.exists(_file, function  (exists) {
	    	if(exists){
	    		res.send(true);
	   		}else{
	    		res.send(false);
	    	}
	    	res.end();
    });
})

//確認是否駐列
app.get("/inlist/:path", function  (req, res) {
	var _path = "upfile/" + req.params.path;
	var _data = ffmpegToMp4.chkStep(_path);
	res.send(""+_data);
	res.end();
});

//檔案下載
app.get("*",function  (req, res) {
    var _file = "upfile" + req.originalUrl;
    fs.exists(_file, function  (exists) {
	    	if(exists){
	    		res.download(_file); //檔案下載
	   		}else{
	    		res.send("沒有這個檔案!");
	    		res.end();
	    	}
    });
});
app.listen(7000);

ffmpegToMp4.onStart = function  ( _id ) {
		console.log('onStart : '+ _id);
		io.to( _id ).emit("data",{progress:"start"});
	}
ffmpegToMp4.onError = function  ( _id, err ) {
		console.log("error! " + _id +" "+err.message);
		io.to( _id ).emit("data",{progress:"error"});
	}
ffmpegToMp4.onProgress = function  ( _id, _progress ) {
		// body...
		console.log('Processing a : '+ _id + " " + _progress + '% done');
		io.to( _id ).emit("data",{progress:_progress});
	}
ffmpegToMp4.onEnd = function  (_id) {
		console.log("end! " + _id);
		io.to( _id ).emit("data",{progress:"end"});
	}
//========================================================================

//資料交換路由器v0.4
var Server = require('socket.io');
var io = new Server();
//var io = require("socket.io").listen(6953);
io.listen(6953);
console.log("server start..");
//申請連線服務
io.on("connection",function(socket){
	console.log("link: " +socket.id);
	//連線
	socket.emit("connection",{
		id:socket.id
	});
	//進入房間
	socket.on("initRoom",function(data){
		socket.join(data.id);
		socket.emit("initRoom",{id:data.id});
	});
	//開新房間，已在房間者都斷線
	socket.on("openRoom",function(data){
		disconnectRoom(data.id);
		socket.join(data.id);
		socket.emit("openRoom",{id:data.id});
	});
	//房間廣播
	socket.on("data",function(data){
		socket.broadcast.to(data.id).emit('data', data);
	});
	//斷線
	socket.on("close",function(data){
		socket.emit("disconnect");
		socket.disconnect();
	});
	//關閉房間所有的連線，只有主控能關
	socket.on("closeRoom",function(data){
		disconnectRoom(data.id);
	});
	//斷線呼叫
	socket.on("disconnect",function(){
		console.log("close: " +socket.id);
	});
	//取回房間連線數量
	socket.on("length",function  (data) {
		socket.emit("length",{id:data.id,length:Object.keys(io.sockets.adapter.rooms[data.id]).length});
	})
	//指定房間廣播 指定id參數
	socket.on("toRoom", function  (data) {
		io.to( data.id ).emit("data",data);
	})
	//房間重開，目前連線都斷線
	function disconnectRoom (roomId) {
		var res = []
		, room = io.sockets.adapter.rooms[roomId]
		, _socket;
		if (room) {
		    for (var id in room) {
		    	_socket = io.sockets.adapter.nsp.connected[id];
		    	_socket.emit("disconnect");
		    	_socket.disconnect();
		    }
		}
	}
});

