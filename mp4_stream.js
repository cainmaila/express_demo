//mp4串流
module.exports = function () {
	var app = {};
	var fs = require('fs');
	/**
	 * [讀取mp4]
	 * @param  {[type]} file [description]
	 * @param  {[type]} req  [description]
	 * @return {[type]}      [description]
	 */
	function loadMp4 ( file ,req ,res) {
		// body...
		var range = req.headers.range,
			_type = "video/mp4";
      	range=range?range:"bytes=0-";
      	var positions = range.replace(/bytes=/, "").split("-");
      	var start = parseInt(positions[0], 10);
      	fs.stat(file, function(err, stats) {
      		var total = stats.size;
        	var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        	var chunksize = (end - start) + 1;
        	res.writeHead(206, {
		        "Content-Range": "bytes " + start + "-" + end + "/" + total,
		        "Accept-Ranges": "bytes",
		        "Content-Length": chunksize,
		        "Content-Type": _type
	        });
	        var stream = fs.createReadStream(file, { start: start, end: end })
        		.on("open", function() {
          			stream.pipe(res);
        		}).on("error", function(err) {
          			res.end(err);
        		});
      	});
	}
	app.loadMp4 = loadMp4;
	return app;
}