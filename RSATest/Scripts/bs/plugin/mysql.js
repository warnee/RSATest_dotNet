bs['plugin+']( 'db', 'mysql', function( fn, bs ){
	fn.require = 'mysql',
	fn.open = function(){
		var t0;
		t0 = this;
		if( !this.__conn ){
			this.__conn = this.require.createConnection( this ),
			this.__conn.on( 'error', function(e){if( e.code === 'PROTOCOL_CONNECTION_LOST') t0._conn = null;} ),
			this.__conn.connect();
		}
		return this.__conn;
	},
	fn.close = function(){this.__conn.destroy();},
	fn.S = function(arg){
		var t0, t1, i, j, k, v;
		i = 0, j = arg.length;
		while( i < j ){
			k = arg[i++], v = arg[i++];
			if( k == null ){
				if( this.__conn ) this.close();
				return delete db[this.sel];
			}
			if( v === undefined ) return k == 'url' ? this.host + ':' + this.port :
				k == 'id' ? this.user :
				k == 'pw' ? this.password :
				k == 'db' ? this.database :
				k == 'open' ? this.open() :
				k == 'close' ? this.close() :
				k == 'rollback' ? this.__conn && this.__conn.rollback() :
				k == 'commit' ? this.__conn && this.__conn.commit() : 0;
			else switch( k ){
				case'url':v = v.split(':'), this.host = v[0], this.port = v[1]; break;
				case'id':this.user = v; break;
				case'pw':this.password = v; break;
				case'db':this.database = v; break;
			}
		}
	},
	fn.execute = function(v){return this.open().query(v);},
	fn.recordset = function( v, end ){this.open().query( v, function( e, r ){e ? end( null, e ) : end(r);});},
	fn.stream = function( v, end ){this.open().query(v).on('result', end );}
	fn.transaction = function( v, end ){
		var conn = this.open();
		conn.beginTransaction( function(e){
			var next, i, j;
			if( e ) end( null, e );
			i = 0, j = v.length, next = function(rs){
				if( i < j ){
					conn.query( v[i++], function( e, rs ){
						if( e ) conn.rollback( function(){end( null, e );} );
						next(rs);
					} );
				}else{
					conn.commit( function(e){
						if( e ) conn.rollback( function(){end( null, e );} );
						end(rs);
					} );
				}
			}, next();
		} );
	};
}, 1.0 );