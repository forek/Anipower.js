//api - 1

var pic = Anp.create({
  watcher:{
  	left:function(oldvalue,newvalue){
  		console.log(newvalue);
  	}
  },
  trigger:{
    click:function(){
    	console.log('click');
    }
  },
  status:[{},{}],
  child:[]
});

var test = new Anp.create({},Anp.$('#p'));