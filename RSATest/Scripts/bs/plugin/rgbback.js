bs['plugin+']( 'style', 'rgbback', function( $style ){
	$style.backR = function( $this, $v ){return $v===undefined?$this.rgbR:($this.s.background='rgb('+parseInt($this.rgbR=$v)+','+parseInt($this.rgbG||0)+','+parseInt($this.rgbB||0)+')',$v);},
	$style.backG = function( $this, $v ){return $v===undefined?$this.rgbG:($this.s.background='rgb('+parseInt($this.rgbR||0)+','+parseInt($this.rgbG=$v)+','+parseInt($this.rgbB||0)+')',$v);},
	$style.backB = function( $this, $v ){return $v===undefined?$this.rgbB:($this.s.background='rgb('+parseInt($this.rgbR||0)+','+parseInt($this.rgbG||0)+','+parseInt($this.rgbB=$v)+')',$v);}
}, 1.0 );