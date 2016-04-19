require.config({
	baseUrl:'lib'
});

require(["anipower"], function(Anp) {
  window.Anp = Anp;
  var li = {
    style:{
      color:'red'
    },
    status:[{
      name:'active',
      style:{
        color:'blue'
      }
    }],
    trigger:{
      click:function(){
        this.props.data.no = this.childNum;
      }
    }
  }

  window.hello = new Anp.create({
    template:{
      li:li
    },
    data:{
      no:0
    },
    watcher:{
      no:function(value,oldvalue){
        if (oldvalue >= 0) {
          this.props.children.li[oldvalue].toggle('init');
        }
        this.props.children.li[value].toggle('active');
      }
    },
    running:function(){
      var self = this;
      return setInterval(function(){
        if (self.props.data.no === 2) {
          self.props.data.no = 0;
        } else {
          self.props.data.no ++ ;
        }
      },1000);
    }
  },Anp.$('#box'));

  // ---- demo - 1
    var flexImg = {
    style:{
      'z-index':1,
      'opacity':'0& 1s'
    },
    status:[{
      name:'active',
      style:{
        'z-index':2,
        'opacity':1        
      }
    }]
  }

  window.flexslider = new Anp.create({
    template:{
      flexImg:flexImg
    },
    data:{
      no:0
    },
    watcher:{
      no:function(value,oldvalue){
        if (oldvalue >= 0) {
          this.props.children.flexImg[oldvalue].toggle('init');
        }
        this.props.children.flexImg[value].toggle('active');
      }
    },
    running:function(){
      var self = this;
     return setInterval(function(){
        if (self.props.data.no === 5) {
          self.props.data.no = 0;
        } else {
          self.props.data.no ++;
        }
      },1000);
    }
  },Anp.$('#flexslider'));

  window.msg = new Anp.create({
    data:{
      msg:'Welcome!',
      name:'Please type'
    }
  },Anp.$('#inputDemo'));

});