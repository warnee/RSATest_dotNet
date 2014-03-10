bs['plugin+']( 'method', 'md5', (function(){
	var t0 = {
		_hexcase:0, _b64pad:"",
		_hex_md5:function(a){
			return this._rstr2hex(this._rstr_md5(this._str2rstr_utf8(a)));
		},
		_b64_md5:function(a){
			return this._rstr2b64(this._rstr_md5(this._str2rstr_utf8(a)));
		},
		_any_md5:function(a, b){
			return this._rstr2any(this._rstr_md5(this._str2rstr_utf8(a)), b);
		},
		_hex_hmac_md5:function(b, a){
			return this._rstr2hex(this._rstr_hmac_md5(this._str2rstr_utf8(b), this._str2rstr_utf8(a)));
		},
		_b64_hmac_md5:function(b, a){
			return this._rstr2b64(this._rstr_hmac_md5(this._str2rstr_utf8(b), this._str2rstr_utf8(a)));
		},
		_any_hmac_md5:function(c, a, b){
			return this._rstr2any(this._rstr_hmac_md5(this._str2rstr_utf8(c), this._str2rstr_utf8(a)), b);
		},
		_rstr_md5:function(a){
			return this._binl2rstr(this._binl_md5(this._rstr2binl(a), a.length * 8));
		},
		_rstr_hmac_md5:function(e, b){
			var f, a, d, g, c;
			f = this._rstr2binl(e);
			if(f.length > 16){
				f = this._binl_md5(f, e.length * 8);
			}
			a = Array(16);
			d = Array(16);
			for(c = 0; c < 16; c++){
				a[c] = f[c] ^ 909522486;
				d[c] = f[c] ^ 1549556828;
			}
			g = this._binl_md5(a.concat(this._rstr2binl(b)), 512 + data.length * 8);
			return this._binl2rstr(this._binl_md5(d.concat(g), 512 + 128));
		},
		_rstr2hex:function(c){
			var g, b, a, d;
			try{
				this._hexcase;
			}catch(f){
				this._hexcase = 0;
			}
			g = this._hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
			b = "";
			for(d = 0; d < c.length; d++){
				a = c.charCodeAt(d);
				b += g.charAt((a >>> 4) & 15) + g.charAt(a & 15);
			}
			return b;
		},
		_rstr2b64:function(c){
			var g, b, a, k, f, d;
			try{
				this._b64pad;
			}catch(h){
				this._b64pad = "";
			}
			g = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
			b = "";
			a = c.length;
			for(f = 0; f < a; f += 3){
				k =(c.charCodeAt(f) << 16) |(f + 1 < a ? c.charCodeAt(f + 1) << 8 : 0) |(f + 2 < a ? c.charCodeAt(f + 2) : 0);
				for(d = 0; d < 4; d++){
					if(f * 8 + d * 6 > c.length * 8){
						b += this._b64pad;
					}else{
						b += g.charAt((k >>> 6 *(3 - d)) & 63);
					}
				}
			}
			return b;
		},
		_rstr2any:function(c, m){
			var b, k, e, a, l, d, h, g, f, n;
			b = m.length;
			h = Array(Math.ceil(c.length / 2));
			for(k = 0; k < h.length; k++){
				h[k] =(c.charCodeAt(k * 2) << 8) | c.charCodeAt(k * 2 + 1);
			}
			g = Math.ceil(c.length * 8 /(Math.log(m.length) / Math.log(2)));
			f = Array(g);
			for(e = 0; e < g; e++){
				d = Array();
				l = 0;
				for(k = 0; k < h.length; k++){
					l =(l << 16) + h[k];
					a = Math.floor(l / b);
					l -= a * b;
					if(d.length > 0 || a > 0){
						d[d.length] = a;
					}
				}
				f[e] = l;
				h = d;
			}
			n = "";
			for(k = f.length - 1; k >= 0; k--){
				n += m.charAt(f[k]);
			}
			return n;
		},
		_str2rstr_utf8:function(c){
			var b, d, a, e;
			b = "";
			d = -1;
			while(++d < c.length){
				a = c.charCodeAt(d);
				e = d + 1 < c.length ? c.charCodeAt(d + 1) : 0;
				if(55296 <= a && a <= 56319 && 56320 <= e && e <= 57343){
					a = 65536 +((a & 1023) << 10) +(e & 1023);
					d++;
				}
				if(a <= 127){
					b += String.fromCharCode(a);
				}else{
					if(a <= 2047){
						b += String.fromCharCode(192 |((a >>> 6) & 31), 128 |(a & 63));
					}else{
						if(a <= 65535){
							b += String.fromCharCode(224 |((a >>> 12) & 15), 128 |((a >>> 6) & 63), 128 |(a & 63));
						}else{
							if(a <= 2097151){
								b += String.fromCharCode(240 |((a >>> 18) & 7), 128 |((a >>> 12) & 63), 128 |((a >>> 6) & 63), 128 |(a & 63));
							}
						}
					}
				}
			}
			return b;
		},
		_str2rstr_utf16le:function(b){
			var a, c;
			a = "";
			for(c = 0; c < b.length; c++){
				a += String.fromCharCode(b.charCodeAt(c) & 255,(b.charCodeAt(c) >>> 8) & 255);
			}
			return a;
		},
		_str2rstr_utf16be:function(b){
			var a, c;
			a = "";
			for(c = 0; c < b.length; c++){
				a += String.fromCharCode((b.charCodeAt(c) >>> 8) & 255, b.charCodeAt(c) & 255);
			}
			return a;
		},
		_rstr2binl:function(b){
			var a, c;
			a = Array(b.length >> 2);
			for(c = 0; c < a.length; c++){
				a[c] = 0;
			}
			for(c = 0; c < b.length * 8; c += 8){
				a[c >> 5] |=(b.charCodeAt(c / 8) & 255) <<(c % 32);
			}
			return a;
		},
		_binl2rstr:function(b){
			var a, c;
			a = "";
			for(c = 0; c < b.length * 32; c += 8){
				a += String.fromCharCode((b[c >> 5] >>>(c % 32)) & 255);
			}
			return a;
		},
		_binl_md5:function(f, e){
			var r, m, q, p, o, n, l, k, j, g, h;
			r = f;
			m = e;
			r[m >> 5] |= 128 <<((m) % 32);
			r[(((m + 64) >>> 9) << 4) + 14] = m;
			q = 1732584193;
			p = -271733879;
			o = -1732584194;
			n = 271733878;
			for(h = 0; h < r.length; h += 16){
				l = q;
				k = p;
				j = o;
				g = n;
				q = this._md5_ff(q, p, o, n, r[h + 0], 7, -680876936);
				n = this._md5_ff(n, q, p, o, r[h + 1], 12, -389564586);
				o = this._md5_ff(o, n, q, p, r[h + 2], 17, 606105819);
				p = this._md5_ff(p, o, n, q, r[h + 3], 22, -1044525330);
				q = this._md5_ff(q, p, o, n, r[h + 4], 7, -176418897);
				n = this._md5_ff(n, q, p, o, r[h + 5], 12, 1200080426);
				o = this._md5_ff(o, n, q, p, r[h + 6], 17, -1473231341);
				p = this._md5_ff(p, o, n, q, r[h + 7], 22, -45705983);
				q = this._md5_ff(q, p, o, n, r[h + 8], 7, 1770035416);
				n = this._md5_ff(n, q, p, o, r[h + 9], 12, -1958414417);
				o = this._md5_ff(o, n, q, p, r[h + 10], 17, -42063);
				p = this._md5_ff(p, o, n, q, r[h + 11], 22, -1990404162);
				q = this._md5_ff(q, p, o, n, r[h + 12], 7, 1804603682);
				n = this._md5_ff(n, q, p, o, r[h + 13], 12, -40341101);
				o = this._md5_ff(o, n, q, p, r[h + 14], 17, -1502002290);
				p = this._md5_ff(p, o, n, q, r[h + 15], 22, 1236535329);
				q = this._md5_gg(q, p, o, n, r[h + 1], 5, -165796510);
				n = this._md5_gg(n, q, p, o, r[h + 6], 9, -1069501632);
				o = this._md5_gg(o, n, q, p, r[h + 11], 14, 643717713);
				p = this._md5_gg(p, o, n, q, r[h + 0], 20, -373897302);
				q = this._md5_gg(q, p, o, n, r[h + 5], 5, -701558691);
				n = this._md5_gg(n, q, p, o, r[h + 10], 9, 38016083);
				o = this._md5_gg(o, n, q, p, r[h + 15], 14, -660478335);
				p = this._md5_gg(p, o, n, q, r[h + 4], 20, -405537848);
				q = this._md5_gg(q, p, o, n, r[h + 9], 5, 568446438);
				n = this._md5_gg(n, q, p, o, r[h + 14], 9, -1019803690);
				o = this._md5_gg(o, n, q, p, r[h + 3], 14, -187363961);
				p = this._md5_gg(p, o, n, q, r[h + 8], 20, 1163531501);
				q = this._md5_gg(q, p, o, n, r[h + 13], 5, -1444681467);
				n = this._md5_gg(n, q, p, o, r[h + 2], 9, -51403784);
				o = this._md5_gg(o, n, q, p, r[h + 7], 14, 1735328473);
				p = this._md5_gg(p, o, n, q, r[h + 12], 20, -1926607734);
				q = this._md5_hh(q, p, o, n, r[h + 5], 4, -378558);
				n = this._md5_hh(n, q, p, o, r[h + 8], 11, -2022574463);
				o = this._md5_hh(o, n, q, p, r[h + 11], 16, 1839030562);
				p = this._md5_hh(p, o, n, q, r[h + 14], 23, -35309556);
				q = this._md5_hh(q, p, o, n, r[h + 1], 4, -1530992060);
				n = this._md5_hh(n, q, p, o, r[h + 4], 11, 1272893353);
				o = this._md5_hh(o, n, q, p, r[h + 7], 16, -155497632);
				p = this._md5_hh(p, o, n, q, r[h + 10], 23, -1094730640);
				q = this._md5_hh(q, p, o, n, r[h + 13], 4, 681279174);
				n = this._md5_hh(n, q, p, o, r[h + 0], 11, -358537222);
				o = this._md5_hh(o, n, q, p, r[h + 3], 16, -722521979);
				p = this._md5_hh(p, o, n, q, r[h + 6], 23, 76029189);
				q = this._md5_hh(q, p, o, n, r[h + 9], 4, -640364487);
				n = this._md5_hh(n, q, p, o, r[h + 12], 11, -421815835);
				o = this._md5_hh(o, n, q, p, r[h + 15], 16, 530742520);
				p = this._md5_hh(p, o, n, q, r[h + 2], 23, -995338651);
				q = this._md5_ii(q, p, o, n, r[h + 0], 6, -198630844);
				n = this._md5_ii(n, q, p, o, r[h + 7], 10, 1126891415);
				o = this._md5_ii(o, n, q, p, r[h + 14], 15, -1416354905);
				p = this._md5_ii(p, o, n, q, r[h + 5], 21, -57434055);
				q = this._md5_ii(q, p, o, n, r[h + 12], 6, 1700485571);
				n = this._md5_ii(n, q, p, o, r[h + 3], 10, -1894986606);
				o = this._md5_ii(o, n, q, p, r[h + 10], 15, -1051523);
				p = this._md5_ii(p, o, n, q, r[h + 1], 21, -2054922799);
				q = this._md5_ii(q, p, o, n, r[h + 8], 6, 1873313359);
				n = this._md5_ii(n, q, p, o, r[h + 15], 10, -30611744);
				o = this._md5_ii(o, n, q, p, r[h + 6], 15, -1560198380);
				p = this._md5_ii(p, o, n, q, r[h + 13], 21, 1309151649);
				q = this._md5_ii(q, p, o, n, r[h + 4], 6, -145523070);
				n = this._md5_ii(n, q, p, o, r[h + 11], 10, -1120210379);
				o = this._md5_ii(o, n, q, p, r[h + 2], 15, 718787259);
				p = this._md5_ii(p, o, n, q, r[h + 9], 21, -343485551);
				q = this._safe_add(q, l);
				p = this._safe_add(p, k);
				o = this._safe_add(o, j);
				n = this._safe_add(n, g);
			}
			return Array(q, p, o, n);
		},
		_md5_cmn:function(h, e, d, c, g, f){
			return this._safe_add(this._bit_rol(this._safe_add(this._safe_add(e, h), this._safe_add(c, f)), g), d);
		},
		_md5_ff:function(g, f, k, j, e, i, h){
			return this._md5_cmn((f & k) |((~f) & j), g, f, e, i, h);
		},
		_md5_gg:function(g, f, k, j, e, i, h){
			return this._md5_cmn((f & j) |(k &(~j)), g, f, e, i, h);
		},
		_md5_hh:function(g, f, k, j, e, i, h){
			return this._md5_cmn(f ^ k ^ j, g, f, e, i, h);
		},
		_md5_ii:function(g, f, k, j, e, i, h){
			return this._md5_cmn(k ^(f |(~j)), g, f, e, i, h);
		},
		_safe_add:function(a, d){
			var c, b;
			c =(a & 65535) +(d & 65535);
			b =(a >> 16) +(d >> 16) +(c >> 16);
			return(b << 16) |(c & 65535);
		},
		_bit_rol:function(a, b){
			return(a << b) |(a >>>(32 - b));
		}
	};
	return function( $v, $64 ){return $v += '', $64 ? t0._b64_md5( $v ) : t0._hex_md5( $v );};
})(), 1.0 );