bs['plugin+']( 'method', 'innerhtml', (function(){console.log( 'innerhtml' );
	var 	t0, t1, t2, t3,
		i,
		n0, n1, n2,
		div, tag, parent,
		trim = /^\s*|\s*$/g;
	div = document.createElement( 'div' );
	tag = {
		thead : [ 0, '<table>', '</table>' ],
		tfoot : [ 0, '<table>', '</table>' ],
		tbody : [ 0, '<table>', '</table>' ],
		caption : [ 0, '<table>', '</table>' ],
		colgroup : [ 0, '<table>', '</table>' ],
		tr :	 [ 1, '<table><tbody>', '</tbody></table>' ],
		col : [ 1, '<table><tbody></tbody><colgroup>', '</colgroup></table>' ],
		td : [ 2, '<table><tbody><tr>', '</tr></tbody></table>' ],
		option : [ 0, '<select>', '</select>' ]
	};
	return function( $str, $target ) {
	/***1. 필터링***/
		//1) 데이터타입 체크
		//2) 문자열 앞, 뒤 공백 제거
		//3) 태그 규칙 체크
		if( typeof $str != 'string' || ( t0 = $str.replace( trim, '' ) ), t0.charAt(0) != '<' ) return console.log('임시 필터링');

	/***2. 태그명 추출***/
		//1) <div style=""></div>, <br /> 태그 내부 ' '(공백) 체크
		//2) <br/> 태그 내부 '/' 체크
		//3) <div></div> 태그 내부 '>' 체크
		n0 = t0.indexOf(' '),
		n1 = t0.indexOf('>'),
		n2 = t0.indexOf('/');
		t1 = ( n0 != -1 && n0 < n1 ) ? t0.substring( 1, n0 ) : ( n2 != -1 && n2 < n1 ) ? t0.substring( 1, n2 ) : t0.substring( 1, n1 );

	/***3. 문자열 => 객체 변환***/
		if( tag[t1] ) {

			//1) innerHTML쓰기 가능 형태로 문자열 조합 후 객체 변환.
			div.innerHTML = tag[t1][1] + $str + tag[t1][2];

			//2) 객체 변환후 1차 필터링.
			t2 = div.childNodes[0];

			//3) 객체 변환후 2차 필터링.
			if( tag[t1][0] ) for( h = 0; h < tag[t1][0]; h++ ) t2 = t2.childNodes[0];
			//4) parent에 반환.
			parent = t2;
		}else {

			//5)  위 과정 1), 2), 3)의 과정
			div.innerHTML = $str;

			//6) parent에 반환.
			parent = div;
		}

		i = parent.childNodes.length;
		if( !$target ) {$target = {length : 0};while( i-- ) $target[$target.length++] = parent.childNodes[i];Array.prototype.reverse.call($target);}
		else while( i-- ) $target.appendChild(parent.childNodes[0]);
		//while( parent.childNodes[0] ) $target.appendChild(parent.childNodes[0]);
		return $target;
	};
})(), 1.0 );
