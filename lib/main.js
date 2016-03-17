require.config({
	baseUrl:'lib'
});

require(["anipower"], function(Anp) {
  var next = {
  		name:'next',
  		style:{
  			'left':'300px'
  		},
  		trigger:{
    		click:function(){
    			this.toggle('init');
    		}
  		}
  	};

  window.hello = new Anp.create({
  	watcher:{
  		left:function(value){
  			console.log(value);
  		}
  	},
    status:[next],
    trigger:{
    	click:function(){
    		this.toggle('next');
    	}
    }
  },Anp.$('#p'));
});