module.exports = function ( command ) {
	// 駐列管理
	var app = {},
		isBusy = false,
		list = [];
	function push (_path) {
		list.push(_path);
		if(!isBusy){
			next();
		}	
	}
	function next () {
		if(list.length>0){
			isBusy = true;
			run(list.shift());
		}else{
			isBusy = false;
		}
	}
	function run(_path) {
		command(_path ,next);
	}
	app.push = push;
	return app;
};