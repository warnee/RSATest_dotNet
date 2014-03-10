bs['plugin+']( 'class', 'sprite', function( fn, bs ){
	var ani, key, ANI;
	bs.Css('.SPRITE').S( 'overflow', 'hidden', 'display', 'none' ),
	bs.Css('.SPRITE img').S( 'display', 'block', 'border', 0, 'margin', 0 ),
	ANI = bs.ANI.ani,
	(function(){
		var t0, i;
		t0 = 'width,height,col,row,time,delay,loop,first,last,end,src'.split(','),
		key = {}, i = t0.length;
		while( i-- ) key[t0[i]] = 1;
	})(),
	ani = function(t){
		var term, time, rate, curr;
		if( ( term = t - this.stime ) < 0 ) return;
		time = this.t, rate = term / time;
		if( term > this.t )
			if( --this.loop ) return this.stime = t + this.d, this.etime = this.stime + this.t, 0;
			else{
				this.div.S( 'display', 'none' );
				if( this.end ) this.end(this);
				return 1;
			}
		curr = this.first + parseInt( rate * ( this.last - this.first ) );
		this.img.S( 'margin-left', -( curr % this.col ) * this.width, 'margin-top', -parseInt( curr / this.col ) * this.height );
	},
	fn.NEW = function(key){this.time = this.row = this.col = 1;},
	fn.S = function(){
		var t0, i, j, k, v;
		if( ( t0 = arguments[0] ).charAt(0) == '@' ){
			if( this[t0] ) t0 = this[t0];
			else ( t0 = this[t0] = {
				width:this.width||100, height:this.height||100, ANI:ani,
				div:bs.Dom('<div class="SPRITE"></div>'),
				img:bs.Dom('<img src="'+this.src+'"/>'),
				col:this.col, row:this.row,
				time:this.time||1, first:this.first||0, last:this.last||this.row*this.col
			} ).div.S( '>', t0.img );
			i = 1, j = arguments.length;
			if( j == 1 ) return t0;
			while( i < j ){
				k = arguments[i++], v = arguments[i++];
				if( key[k] ) t0[k] = v;
				else if( k == 'div' ) return t0.div;
				else if( k == 'img' ) return t0.img;
				else if( k == '@' || k == 'ani' ) return t0.img.S( 'margin-left', 0, 'margin-top', 0, 'width', t0.width*t0.col, 'height', t0.height*t0.row ),
					t0.div.S( 'width', t0.width, 'height', t0.height, 'display', 'block' ),
					t0.t = t0.time * 1000, t0.d = t0.delay * 1000, t0.stime = Date.now() + (t0.delay||0), t0.etime = t0.stime + t0.t, ANI( t0 );
				else if( k == 'frame') return t0.img.S( 'width', t0.width*t0.col, 'height', t0.height*t0.row, 
					'margin-left', -(v%t0.col)*t0.width, 'margin-top', -parseInt(v/t0.col)*t0.height ),
					t0.div.S( 'width', t0.width, 'height', t0.height, 'display', 'block' );
				else t0.div.S( k, v );
			}
		}else{
			i = 0, j = arguments.length;
			while( i < j ){
				if( !key[k = arguments[i++]] ) throw 1;
				this[k] = arguments[i++];
			}
		}
	};
}, 1 );