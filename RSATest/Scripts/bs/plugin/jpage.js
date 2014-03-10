bs['plugin+']( 'method', 'jpage', (function(){
	var jp = function(v){this.v = v;}, cache={}, b = '<%', e = '%>', err = [], line = [],
	r0=/\\/g, r1=/["]|\n|\r\n|\r/g, r2=/at /g, r3=/["]|[<]|\t|[ ][ ]|\n|\r\n|\r/g, r4 = /\n|\r\n|\r/g, r5=/[<]|\t|[ ][ ]/g,
	toCode = function(_0){switch(_0){case'"':return'\\"'; case'\n':case'\r\n':case'\r':return'\\n'; default:return _0;}},
	toHtml = function(_0){switch(_0){case'"':return'\\"'; case'<':return'&lt;';case'\t':return'&nbsp; &nbsp; ';
		case'  ':return'&nbsp; '; case'\n':case'\r\n':case'\r':return'<br>'; default:return _0;}},
	jpage = function( s, data, renderer, id ){
		var str, t0, t1, i, j, k, v, m, importer, render;
		if( !( jpage.cache && ( v = cache[id] ) ) ){
			if( s instanceof jp ) v = s.v;
			else{
				str = ( s.substr( 0, 2 ) == '#T' ? ( s = bs.Dom(s).S('@text') ) : s.substr( s.length - 5 ) == '.html' ? bs.get( null, s ) : s ).split(b);
				v = 'try{', i = 0, j = str.length;
				while( i < j ){
					t0 = str[i++];
					if( ( k = t0.indexOf(e) ) > -1 ) t1 = t0.substring( 0, k ), t0 = t0.substr( k + 2 ), 
						v += '$$E[$$E.length]="<%' + t1.replace( r0, '\\\\' ).replace( r3, toHtml ) + '%>";' +
							( t1.charAt(0) == '=' ? 'ECHO(' + t1.substr(1) + ')' : t1 ) + 
							';$$L[0]+=' + t1.split(r2).length + ';';
					v += 'ECHO($$E[$$E.length]="' + t0.replace( r0, '\\\\' ).replace( r1, toCode ) + '"),$$L[0]+=' + t0.split(r4).length + ';';
				}
				v += '}catch(e){return e;}';
			}
			t0 = s.v ? s : new jp(v);
			if( jpage.cache && id ) cache[id] = v;
		}
		t1 = '', importer = function(url){render(jpage( url, data, null, jpage.cache ? url : 0 ));},
		render = renderer ? function(v){t1 += v, renderer(v);} : function(v){t1 += v;};
		try{
			line[0] = err.length = 0, i = new Function( 'ECHO,IMPORT,$$E,$$L,$,bs', v )( render, importer, err, line, data, bs );
			if( !( i instanceof Error ) ) i = 0;
		}catch(e){i = e;}
		if( i ){
			str = '<h1>Invalid template error: bs.jpage</h1><hr>';
			if( m = err.length ) str += '<b>code: </b>error occured line number - '+line[0]+'<br>'+err[err.length-1]+'<hr>';
			j = Object.getOwnPropertyNames(i), k = j.length;
			while( k-- ) str += '<b>' + j[k] +'</b>: '+( i[j[k]].replace ? i[j[k]].replace( r2, '<br>at ' ) : i[j[k]] )+'<br>';
			str += '<hr><b>template:</b><br>';
			k = s.replace ? s.split(r4) : s.v.split(r4);
			for( i = 0, j = k.length ; i < j ; i++ ) str += '<div'+( m && ( i + 1 == line[0] )?' style="background:#faa"' : '' ) + '><b>' + ( i + 1 ) + ':</b> ' + k[i].replace( r5, toHtml ) + '</div>';
			return str;
		}
		return t1;
	};
	jpage.cache = 1;
	return jpage;
})(), 1.0 );