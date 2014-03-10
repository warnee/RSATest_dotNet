bs['plugin+']('class', 'd3', (function(){
    // d3카메라세팅
    var d3Camera={
        pan:0.01, tilt:0.01, x:0, y:0, z:0, farclip:2500, speed:10, list:[],
        forward:undefined, backward:undefined, left:undefined, right:undefined, panleft:undefined, panright:undefined, tiltup:undefined, tiltdown:undefined, up:undefined, down:undefined,
        S:function(){
            var i, j, k, v;
            i=0, j=arguments.length;
            if(j==1) return this[arguments[0]];
            while(i<j) k=arguments[i++], v=arguments[i++], this[k]=v
        },
        ANI:function($time){
            var list=this.list, i=list.length, keys=bs.KEY, sin=Math.sin(this.pan) , cos=Math.cos(this.pan), speed=this.speed
            if(!i) return
            if(keys[this.forward]) this.x-=speed*sin, this.z+=cos*speed
            if(keys[this.backward]) this.x+=speed*sin, this.z-=cos*speed
            if(keys[this.left]) this.x-=speed*cos, this.z-=speed*sin
            if(keys[this.right]) this.x+=speed*cos, this.z+=speed*sin
            if(keys[this.up]) this.y-=speed
            if(keys[this.down]) this.y+=speed
            if(keys[this.panleft]) this.pan+=speed/500
            if(keys[this.panright]) this.pan-=speed/500
            if(keys[this.tiltup]) this.tilt+=speed
            if(keys[this.tiltdown]) this.tilt-=speed

            var world
            for(var k=0; k<i; k++){
                world = list[k].div.S('<')
                if(world) {
                    world=bs.Dom('#'+list[k].div.S('<').id)
                    break
                }
            }
            var w=world.S('w'), h=world.S('h')
            while(i--){
                var t=list[i], dx, dz, tx, tz, tScale, zIndex, width=t.width, height=t.height, farclip=this.farclip;
                dx=t.x-this.x, dz=t.z-this.z;
                // 카메라를 중심으로 플랜의 위치를 구함
                tx=cos*dx+sin*dz;
                tz=-sin*dx+cos*dz;
                tScale=w/tz // 대충거리로...크기비율을 결정
                if(tz<0.1 || tz>this.farclip) t.div.S('display', 'none')
                else zIndex=parseInt(tz*100000-tz*100),  // 안겹치게...제트축만들고... 혹시나 살짝빼서 또 겹치는걸 없앰
                    t.div.S(
                        'display', 'block',
                        // 멀리있는건 거리에 대해 스케일 비율이 달라짐
                        'width', tScale*.5+width*tScale/2, 'height', tScale*.5+height*tScale/2,
                        'margin-left', (tx-width/4)*tScale+w/2, 'margin-top', this.tilt-tScale*this.y-(tScale+height/2*tScale )/2+h/2,// this.tilt+(this.y-height/4)* tScale-this.y*tScale+h/2,
                        'opacity', (farclip-tz)>farclip/5 ? 1 : (farclip-tz+farclip/5)/farclip,
                        // z소팅
                        'z-index', parseInt(100*tScale)
                    )
            }
        }
    };
    // D3m
    bs.cls('D3m', function($fn){
        $fn.NEW=function($key){
            this.__list={};
            this.dom=bs.Dom("<div></div>").S('<', 'body', 'top', -100000, 'display', 'none', 'this'); // 안불러져서 박았음 -_-
        }
        $fn.S=function(){
            var i, j, k, v;
            i=0, j=arguments.length;
            if(j==1) return this[arguments[0]];
            while(i<j) k=arguments[i++], v=arguments[i++], this.dom.S(k, v);
            for(var i in this.__list) this.__list[i].S('html', this.dom.S('html'))
        }
    });
    // d3
    return function($fn){
        var key, type={"doom":1};
        bs.Css('.D3').S('position', 'absolute'), bs.Css('.D3 img').S('width', '100%', 'height', '100%', 'position', 'absolute'),
            (function(){
                var t0, i;
                t0='x,y,z,width,height,material'.split(','), key={}, i=t0.length;
                while(i--) key[t0[i]]=1;
            })(),
            $fn.NEW=function($key){
                var tname=$key.split('@')[1];
                if($key.indexOf('camera@')> -1) type[tname] ? console.log('cameraMode :', tname) : console.log('존재하지않는 카메라타입입니다'), bs.ANI.ani(d3Camera), this.camera=d3Camera
                else if($key.indexOf('plane@')> -1) this.x=this.y=this.z=this.width=this.height=0, this.div=bs.Dom("<div class='D3' id='"+tname+"'>재질적용전</div>"), d3Camera.list.push(this), this.material=undefined
            },
            $fn.S=function(){
                var i, j, k, v;
                i=0, j=arguments.length;
                if(j==1) return this[arguments[0]];
                var prevMaterial=this.material
                while(i<j){
                    k=arguments[i++], v=arguments[i++];
                    if(key[k]) this[k]=v;
                    else if(k=='div') return this.div;
                    else if(k=='material') return this.material;
                    else if(k=='camera') return this.camera;
                    else this.div.S(k, v);
                    if(k=='material'){
                        // 기존에 적용된 재질이 있으면 적용취소함
                        if(prevMaterial!=this.material) if(bs.D3m(prevMaterial)) delete bs.D3m(prevMaterial).__list[this.__k ];
                        bs.D3m(this.material).__list[this.__k]=this.div
                        //console.log(bs.D3m(this.material).__list)
                        //console.log('this.materialName으로 검색 ' ,bs.D3m(this.material))
                        //console.log('재질 dom검색 ' ,bs.D3m(this.material).S('dom').S('html'))
                        this.div.S('html', bs.D3m(this.material).S('dom').S('html'))
                    }
                }
            }
    }
})(), 1.0);