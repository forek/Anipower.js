var a = new Anp.createComponent({
	text:"hello world!",
	style:"left {test1}:8px & 2s;position:absolute;color {test2}:red & 2s;",
	trigger:{
		type:"click",
	    func:function(event){
	    	this.toggle('next');
	        }
        }
    });

a.newState({
	name:"next",
	style:"left:100px;color:blue",
	trigger:{
		type:"click",
		func:function(){
			this.toggle('init');
		}
	}
});

a.addConvert("left",function(value){
   var data = value.slice(0,value.indexOf("px"));
   if(data.indexOf(".") > 0){
   	data = data.slice(0,data.indexOf("."));
   }
   return data;
});

Anp.render(a);

var b = new Anp.createComponent({
	text:"auto test",
	initStyle:"left:8px & 2s;position:absolute;",
	initTrigger:{
		type:"auto",
		lifetime:2000,
		func:function(){
			this.toggle('blue');
		}
	}
});

b.newState({
	name:"blue",
	style:"left:100px"
})

Anp.render(b);

var c = new Anp.createComponent({
    style:"color {test2}:auto;",
	trigger:{
		type:"click",
	    func:function(event){
	    	this.toggle('next');
	        }
        }
},Anp.$("#p"));

var c = new Anp.createComponent({
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

var c = new Anp.createComponent({
    style:"color {test2}:auto;"
},Anp.$("#p"));

var c = new Anp.createComponent({
    style:{color:'auto {test2}'}
},Anp.$("#p"));