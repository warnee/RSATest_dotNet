bs['plugin+']( 'static', 'router', (function(){console.log( 'router' );
	var s, e, t, h, count;
	s = {'#':[]}, e = {'#':[]}, t = {}, h = [], count = 5;
	function make( t ){
		return function( $path, $func ){
			var t0, i, j, k, v;
			i = 0, j = arguments.length;
			while( i < j ){
				k = arguments[i++], v = arguments[i++];
				if( !( t0 = t[k] ) ) t[k] = t0 = [];
				t0[t0.length] = v;
			}
		};
	}
	function router(){
		var uri, t0, i, j, k;
		if( !( uri = location.hash ) ) uri = location.hash = '#';
		h[h.length] = uri;
		if( h.length > count ) h.splice( 0, h.length - count );
		t0 = s['#'], i = 0, j = t0.length;
		while( i < j ) t0[i++]( uri );
		if( uri != '#' )
			for( k in s ) if( k != '#' && uri.indexOf( k ) > -1 ){
				t0 = s[k], i = 0, j = t0.length;
				while( i < j ) t0[i++]( uri );
			}
		for( i in t ) if( uri.indexOf( i ) > -1 ) t[i](uri);
		t0 = e['#'], i = 0, j = t0.length;
		while( i < j ) t0[i++]( uri );
		if( uri != '#' )
			for( k in e ) if( k != '#' && uri.indexOf( k ) > -1 ){
				t0 = e[k], i = 0, j = t0.length;
				while( i < j ) t0[i++]( uri );
			}
	}
	return {
		start:make(s),end:make(e),
		table:function(){
			var i, j;
			i = 0, j = arguments.length;
			while( i < j ) t[arguments[i++]] = arguments[i++];
		},
		go:function( $str ){location.hash = $str;},
		route:function(){arguments[0] === null ? bs.WIN.on( 'hash' ) : ( bs.WIN.on( 'hashchange', router ),router() );},
		historyMax:function($len){count=$len;}, history:h
	};
})(), 1.0 );