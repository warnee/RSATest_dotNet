bs['plugin+']( 'method', 'test', (function(){
	var rules, set, rule, group;
	group = {},
	rules = {
		ip:parseRule('/^((([0-9]{1,2})|(1[0-9]{2})|(2[0-4][0-9])|(25[0-5]))\\.){3}(([0-9]{1,2})|(1[0-9]{2})|(2[0-4][0-9])|(25[0-5]))$/'),
		url:parseRule('/^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)/'),
		email:parseRule('/^(\\w+\\.)*\\w+@(\\w+\\.)+[A-Za-z]+$/'),
		korean:parseRule('/^[ㄱ-힣]+$/'),
		japanese:parseRule('/^[ぁ-んァ-ヶー一-龠！-ﾟ・～「」“”‘’｛｝〜−]+$/'),
		alpha:parseRule('/^[a-z]+$/'),
		ALPHA:parseRule('/^[A-Z]+$/'),
		pass:parseRule('/^[\\w]+$/'),
		num:parseRule('/^[0-9]+$/'),
		alphanum:parseRule('/^[a-z0-9]+$/'),
		'1alpha':parseRule('/^[a-z]/'),
		'1ALPHA':parseRule('/^[A-Z]/'),
		float:function(v){return '' + parseFloat(v) === v;},
		int:function(v){return '' + parseInt( v, 10 ) === v;},
		length:function( v, a ){return ( v ? v.length : 0 ) === +a[0];},
		range:function( v, a ){return v = v ? v.length : 0, +a[0] <= v && v <= +a[1];},
		indexOf:function( v, a ){
			var i, j;
			i = a.length;
			while( i-- ) if( v.indexOf(a[i]) == -1 ) j = 1;
			return j ? 0 : 1;
		},
		ssn:(function(){
			var r, key;
			r = /\s|-/g, key = [2,3,4,5,6,7,8,9,2,3,4,5];
			return function(v){
				var t0, t1, i;
				t1 = v.replace( r, '' );
				if( t1.length != 13 ) return;
				for( t0 = i = 0 ; i < 12 ; i++ ) t0 += key[i] * t1.charAt(i);
				return parseInt( t1.charAt(12) ) == ( ( 11 - ( t0 % 11 ) ) % 10);
			};
		})(),
		biz:(function(){
			var r, key;
			r = /\s|-/g, key = [1,3,7,1,3,7,1,3,5,1];
			return function(v){
				var t0, t1, t2, i;
				t2 = v.replace( r, '' );
				if( t2.length != 10 ) return;
				for( t0 = i = 0 ; i < 8 ; i++ ) t0 += key[i] * t2.charAt(i);
				t1 = "0" + ( key[8] * t2.charAt(8) ), t1 = t1.substr( t1.length - 2 ),
				t0 += parseInt( t1.charAt(0) ) + parseInt( t1.charAt(1) );
				return parseInt( t2.charAt(9) ) == ( 10 - ( t0 % 10)) % 10;
			};
		})()
	},
	set = {};
	function arg( k, v, list ){
		var t0 = bs.trim(v.substring( 0, k ).split('|'));
		list[list.length++] = parseRule(t0.shift()),
		list[list.length++] = t0;
	}
	function parse(data){
		var s, t0, t1, t2, i, j, k, l;
		s = {}, data = data.split('\n'), l = data.length;
		while( l-- ){
			t0 = data[l].split('='), t1 = {length:0};
			while( ( j = 0, k = t0[1].indexOf('AND') ) > -1 || ( j = 1, k = t0[1].indexOf('OR') ) > -1 )
				arg( k, t0[1], t1 ), t1[t1.length++] = j ? ( (k += 2), 'OR' ) : ( (k += 3), 'AND' ), t0[1] = t0[1].substr(k);
			arg( t0[1].length, t0[1], t1 ), t2 = bs.trim(t0[0].split(',')), i = t2.length;
			while( i-- ) s[t2[i]] = t1;
		}
		return rule = s;
	}
	function parseRule(k){
		if( typeof k == 'function' ) return k;
		if( k.charAt(0) == '/' && k.charAt(k.length - 1) == '/' ){
			k = new RegExp(k.substring( 1, k.length - 1 ));
			return function(v){return k.test(v);};
		}else if( rules[k] ) return rules[k];
		else return function(v){ return v === k; };
	}
	function val(v){
		var t0;
		if( typeof v == 'function' ) return v();
		if( v.indexOf( '|' ) > -1 ){
			t0 = bs.trim(v.split('|'));
			return bs.trim( bs.Dom(t0[0]).S( t0[1] || '@value' ) );
		}else return bs.trim(t0);
	}
	(function(){
		var t0 = 'group,set,rule'.split(','), i = t0.length;
		while( i-- ) test[t0[i]] = 1;
	})();
	function test(r){
		var t0, t1, t2, i, j, k, l, v, m, n;
		i = 1, j = arguments.length;
		if( test[r] ){
			if( r == 'group' ) group[arguments[1]] = Array.prototype.slice.call( arguments, 2 );
			else if( r == 'set' ) while( i < j ){
				k = arguments[i++], v = arguments[i++]
				if( v.substr( 0, 2 ) == '#T' ) set[k] = parse(bs.Dom(v).S('@text'));
				else if( v.substr( v.length - 5 ) == '.html' ) set[k] = parse(bs.get( null, v ));
				else set[k] = parse(v);
			}else if( r == 'rule' ) while( i < j ) rules[arguments[i++]] = parseRule(arguments[i++]);
			return;
		}else if( !r ){
			if( !(t0 = rule) ) bs.err( 0, 'no prevRule' );
		}else if( r.charAt(0) == '@' ){ //rule
			t0 = r.substr(1).split('|');
			if( !( t1 = rules[t0[0]] ) ) bs.err( 0, 'no rule' );
			t0 = t0.slice(1);
			while( i < j ) if( !t1( val( arguments[i++] ), t0 ) ) return;
			return 1;
		}else if( set[r] ) t0 = set[r];
		else if( r.substr( 0, 2 ) == '#T' ) t0 = parse(bs.Dom(r).S('@text'));
		else if( r.substr( r.length - 5 ) == '.html' ) t0 = parse(bs.get( null, r ));
		else t0 = parse(r);
		//ruleset
		while( i < j ){
			k = arguments[i++];
			if( k.charAt(0) == '@' ){//group
				if( !(t1 = group[k.substr(1)]) ) bs.err( 0, 'no group' );
				m = 0, n = t1.length;
				while( m < n ){
					if( !( t2 = t0[t1[m++]] ) ) bs.err( 0, 'no rule' );
					k = 0, l = t2.length, v = val(t1[m++]);
					while( k < l ){
						if( !t2[k++]( v, t2[k++] ) ){
							if( t2[k++] != 'OR' ) return;
						}else if( t2[k++] == 'OR' ) break;
					}
				}
			}else{
				if( !( t2 = t0[k] ) ) bs.err( 0, 'no rule' );
				k = 0, l = t2.length, v = val(arguments[i++]);
				while( k < l ){
					if( !t2[k++]( v, t2[k++] ) ){
						if( t2[k++] != 'OR' ) return;
					}else if( t2[k++] == 'OR' ) break;
				}
			}
		}
		return 1;
	}
	return test;
})(), 1.0 );
