
//分段粘贴到浏览器控制台中运行,运行其他代码段需刷新

//a.创建动画组件、CSS数据实时绑定
//运行后点击红色hello world 可查看效果
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

Anp.render(a); //渲染


//b.自动触发
var b = new Anp.createComponent({
	text:"auto test",
	style:"left:8px & 2s;position:absolute;",
	trigger:{
		type:"auto",
		lifetime:2000,//自动触发组件生命长度
		func:function(){//该触发事件自动触发
			this.toggle('blue');
		}
	}
});

b.newState({
	name:"blue",
	style:"left:100px"
})

Anp.render(b);


//c.现有DOM元素转化
var c = new Anp.createComponent({
    style:"color {test2}:auto;",
	trigger:{
		type:"click",
	    func:function(event){
	    	this.toggle('next');
	        }
        }
},Anp.$("#p"));

c.newState({
	name:"next",
	style:"color:blue & 2s;",
	trigger:{
		type:"click",
		func:function(){
			this.toggle('init');
		}
	}
});
//转化现有DOM元素不需渲染

//c.现有DOM元素转化(anp:style属性模式)
var c = new Anp.createComponent({
//Anp.createComponent()中不设置style,读取dom元素<p id="p" style="color:green" anp:style = "color {test2}:auto;" >Hello World</p> 中 anp:style = "color {test2}:auto;" 作为style
	trigger:{
		type:"click",
	    func:function(event){
	    	this.toggle('next');
	        }
        }
},Anp.$("#p"));

c.newState({
	name:"next",
	style:"color:blue & 2s;",
	trigger:{
		type:"click",
		func:function(){
			this.toggle('init');
		}
	}
});

//c.现有DOM元素转化(简化)
var c = new Anp.createComponent({
    style:"color {test2}:auto;"//字符串式style设置方法
},Anp.$("#p"));

//c.现有DOM元素转化(简化)
var c = new Anp.createComponent({
    style:{color:'auto {test2}'}//对象式style设置方法
},Anp.$("#p"));