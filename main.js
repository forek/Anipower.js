require(["anipower"], function(Anp) {
    var Anp = Anp;

    var a = new Anp.createComponent({
	text:"hello world!", //设置文本
	style:"left {test1}:8px & 2s;position:absolute;color {test2}:red & 2s;",//设置css,left {test1}指定该组件left数据绑定到{{test1}}模板上,& 2s指定left过渡时间为2s
	trigger:{ //触发器
		type:"click",//事件类型
	    func:function(event){ //触发事件
	    	this.toggle('next'); //this.toggle( status ) 切换状态
	        }
        }
    });

a.newState({ //新状态
	name:"next", //状态名
	style:"left:100px;color:blue", //状态css
	trigger:{ //触发器
		type:"click",
		func:function(){
			this.toggle('init');
		}
	}
});

a.addConvert("left",function(value){ //数据处理器:left变化时,传到绑定位置之前处理left的值
   var data = value.slice(0,value.indexOf("px")); //去掉字符串中的px
   if(data.indexOf(".") > 0){
   	data = data.slice(0,data.indexOf("."));//去掉小数
   }
   return data;
});

Anp.render(a);
});