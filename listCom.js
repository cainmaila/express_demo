module.exports = function ( command ) {
	// 駐列管理
	var app = {},
		isBusy = false,
		list = [],
		nowPath = "";
	function push (_path) {
		list.push(_path);
		if(!isBusy){
			next();
		}	
	}
	function next () {
		if(list.length>0){
			isBusy = true;
			nowPath = list.shift();
			run( nowPath );
		}else{
			isBusy = false;
		}
	}
	function run(_path) {
		command(_path ,next);
	}
	//檢視進度 -2正在處理 -1查無資料
	function chkStep (_path) {
		if(isBusy){
			if( _path == nowPath ){
				return -2;
			}else{
				return list.indexOf(_path);
			}
		}else{
			return -1;
		}
	}
	app.push = push;
	app.chkStep = chkStep;
	return app;
};