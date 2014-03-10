bs['plugin+']( 'method', 'fps', (function(){console.log( 'fps' );
	var printer, prev, sum, cnt, isStop;
	prev = sum = cnt = 0;
	function fps(){
		if( arguments.length ){
			if( printer ) throw 'fps is running';
			isStop = 0,
			printer = arguments[0],
			bs.ANI.ani( fps );
		}else{
			isStop = 1,
			printer = null;
		}
	}
	fps.ANI = function( $time ){
		var i;
		i = parseInt(1000/(($time - prev)||1)),
		sum += i, cnt++,
		printer.innerHTML = "fps("+i+"/"+parseInt( sum / cnt )+')',
		prev = $time;
		if( cnt > 60000 ) cnt = sum = 0;
		return isStop;
	};
	return fps;
})(), 1.0 );