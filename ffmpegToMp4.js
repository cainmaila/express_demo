module.exports = (function () {
	//轉檔駐列
	var ffmpeg = require('fluent-ffmpeg'),
		app = this,
		fs = require('fs-extra'), 
		listCom = require('./listCom')(function  (_path,_next) {
			//var mp4Id = Date.now() + ( ( Math.random()*20000 ) >>1 ),
			var mp4Id = _path.split("/")[1].split(".")[0];
				command = new ffmpeg(_path)
					//.inputFormat('avi')
					.size('720x?')
					.on("start", function() {
						app.onStart( mp4Id );
						//console.log('An start: ' + _path);
					  })
					.on('error', function(err) {
						app.onError( mp4Id, err);
					    //console.log('An error occurred: ' + err.message);
					    _next();
					  })
					.on('progress', function(progress) {
					    //console.log('Processing a : ' + progress.percent + '% done');
					    app.onProgress( mp4Id, progress.percent );
					  })
					.on("end",function  () {
						fs.rename('upfile/' + mp4Id + '_.mp4', 'upfile/' + mp4Id + '.mp4', function(err) {
							if (err) throw err;
							//console.log("end! " + mp4Id);
							app.onEnd( mp4Id );
							_next();
						});
					})
					.save('upfile/' + mp4Id + '_.mp4');
		});
	ffmpeg.setFfmpegPath("D:/ffmpeg/bin/ffmpeg.exe");
	ffmpeg.setFfprobePath("D:/ffmpeg/bin/ffprobe.exe");
	this.push = function  (_path) {
		listCom.push(_path);
	}
	this.onProgress = function  ( _id, _progress ) {
		// body...
		console.log('Processing a : '+ _id + " " + _progress + '% done');
	}
	this.onEnd = function  (_id) {
		console.log("end! " + _id);
	}
	this.onError = function  (_id , err) {
		console.log("error! " + _id +" "+err.message);
	}
	this.onStart = function  (_id) {
		console.log("start! " + _id);
	}
	this.chkStep = listCom.chkStep;
	return this;
})();
