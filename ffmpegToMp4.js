module.exports = (function () {
	//轉檔駐列
	var ffmpeg = require('fluent-ffmpeg'),
		listCom = require('./listCom')(function  (_path,_next) {
			//var mp4Id = Date.now() + ( ( Math.random()*20000 ) >>1 ),
			var mp4Id = _path.split("/")[1].split(".")[0];
				command = new ffmpeg(_path)
					.inputFormat('mp4')
					.on("start", function() {
						console.log('An start: ' + _path);
					  })
					.on('error', function(err) {
					    console.log('An error occurred: ' + err.message);
					    _next();
					  })
					.on('progress', function(progress) {
					    console.log('Processing a : ' + progress.percent + '% done');
					  })
					.on("end",function  () {
						console.log("end! " + mp4Id);
						_next();
					})
					.save('mp4/' + mp4Id + '.mp4');
		});
	ffmpeg.setFfmpegPath("D:/ffmpeg/bin/ffmpeg.exe");
	ffmpeg.setFfprobePath("D:/ffmpeg/bin/ffprobe.exe");
	this.push = function  (_path) {
		listCom.push(_path);
	}
	return this;
})();
