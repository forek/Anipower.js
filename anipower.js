/**
*Anipower.js
*ver 0.1
*https://github.com/forek/Anipower.js
*/

(function (window,AnpConstruction) {
   window.Anp = AnpConstruction();
}(this, function () {
	'use strict';

/**
*createApi(object);
*object = {
*  el:"String",
*  type:"String",
*  initCss:"String"
*}
*/

  function throwError (err) {
    if ( typeof err === "string" ) {
      throw "Anipower.js : " + err;
    }else{
      throw "Anipower.js : unknow error";
    }
  }

  function replaceSpace (str) {
    return str.replace(/\s/g,'');    
  }
  
  function checkModel (textContent) {
    if(textContent){
      var start,end;
      start = textContent.indexOf("{{") + 2;
      end = textContent.indexOf("}}");
      if (start && end && start > 0 && end > 0 && end > start){
        var model = textContent.slice(start,end);
          return model;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  function setTransition (node,trs) {
    if (node && trs) {
      for (var i = 0;i<trs.length;i++) {
        for(var key in trs[i]) {
          if (node.style.transition){
            node.style.transition += (',' + key + ' ' + trs[i][key]);
          } else {
            node.style.transition = (key + ' ' + trs[i][key]);
          }
        }
      }
    }
  }

  function clone (obj) {
    var objClone = {};
    for ( var key in obj) {
      if(key !== 'RenderedEl' &&  key !== 'modelList') {
        if ( typeof obj[key] === 'object') {
          objClone[key] = clone(obj[key]);
        } else {
          objClone[key] = obj[key];
        }
      }
    }
    return objClone;
  }

  function nodeTraversal (node,value) {

    /*if ( node.getAttribute && node.getAttribute("anp-model") === value ) {
      return node;
    }*/

    if (node.firstChild) {
      if (checkModel(node.firstChild.textContent) === value) {
        return node;
      }
    }
    if ( node.childNodes && node.childNodes.length > 0) {
      for (var i in node.childNodes) {
        var cache = nodeTraversal(node.childNodes[i],value);
        if (cache) {
          return cache;
        }
      }
    } else {
      return ;
    }

  }


/*
    var body = document.getElementsByTagName("body")[0];

    function nodeTraversal (node,value) {

    if ( node.getAttribute && node.getAttribute("anp-model") === value ) {
      return node;
    }

    if ( node.childNodes && node.childNodes.length > 0) {
       var cache = nodeTraversal(node.firstChild,value);
       if (cache) {
         return cache;
       }
    }

    if ( node.nextSibling ) {
      var cache = nodeTraversal(node.nextSibling,value);
      if (cache) {
        return cache;
      }
    }

    if ( !node.childNodes && node.childNodes.length <= 0 && node.nextSibling) {
      return ;
    }
  }
*/


  function bind (el,triggers) {
    if (triggers.type === "auto") {
      var func = function () {
        var auto,Rel;
        auto = true;
        Rel = this.RenderedEl;
        if(triggers.lifetime){
          setTimeout(function(){
            Rel.parentNode.removeChild(Rel);
          },triggers.lifetime);
        }
        triggers.func.apply(this,[auto]);
      }
      return func;
    } else {
      var EventType,next;
      if (triggers.type.slice(0,2) === "on") {
        EventType = triggers.type;
      } else {
        EventType = "on" + triggers.type;
      }
    
      if (window.removeEventListener) {
        el.removeEventListener(EventType,function(){},false);
      } else {
        throwError("wrong bowser");
      }

      el[EventType] = function (event) {
        triggers.func.call(event.target.AnpSource,[event]);
        function runWatch(){
          if (this.watch) {
            this.watch();
          }
        };
        runWatch.call(event.target.AnpSource,[event]);
      };

      return;          
    }

  }

  function createApi (Anp) {
    Anp.createComponent = function (opt,rel) {

      if ( rel && rel instanceof HTMLElement ) {
        var signature = "Create by Anp";
        var RelStyle = document.defaultView.getComputedStyle(rel,null);
        this.child = [] ; 

        this.type = rel.tagName;

        this.text = rel.firstChild.textContent;
        
        if (opt.style) {
          setStyle.call(this,opt.style)
        } else if (rel.getAttribute('anp:style')) {
          setStyle.call(this,rel.getAttribute('anp:style'));
        }

  
        if (opt.trigger) {
          if (typeof opt.trigger === "object") {
            this.initTrigger = opt.trigger;
          }
          bind(rel,this.initTrigger);
        }

        for (var key in this.initStyle) {
          if (this.initStyle[key] === 'auto') {
            this.initStyle[key] = RelStyle[key];
          }
        }

        if (this.modelList) {
          this.watch = Anp.regist(rel,this.modelList,this.convertList);
        }
        
        rel.AnpSource = this;

        this.RenderedEl = rel;

        this.showSignature = function(){
          return signature;
        }
        
      } else {
        var signature = "Create by Anp";
        this.child = [] ; 

        ( typeof opt === "object" ) && ( opt.el && typeof opt.el === "string" ) ? this.el = opt.el : this.el = 'body' ;

        opt.type && typeof opt.type === "string" ? this.type = opt.type : this.type = "div" ;

        opt.text && typeof opt.text === "string" ? this.text = opt.text : this.text = "" ;

        if (opt.trigger) {
          if (typeof opt.trigger === "object") {
            this.initTrigger = opt.trigger;
          }
        }
        
        if (opt.style) setStyle.call(this,opt.style);

        this.showSignature = function(){
          return signature;
        }
      }
      

      function setStyle (ObjStyle) {
        if (ObjStyle) {
          this.initStyle = {};              
          this.modelList = {};
          if (typeof ObjStyle === "string") {
          var initStyle = ObjStyle.split(';') ;
            for (var i in initStyle) {
              if (initStyle[i].length > 0) {
                var cache = initStyle[i].split(':');
                if ( cache.length === 2) {
                var name,style;
                name = cache[0];
                style = cache[1];
              
              if ( name.indexOf("{") && name.indexOf("}") && name.indexOf("{") < name.indexOf("}") ) {
                var start,end,model;
                start = name.indexOf("{") + 1;
                end = name.indexOf("}");
                model = replaceSpace(name.slice(start,end));
                name = replaceSpace(name.slice(0,start - 1)  + name.slice(end + 1));
                
                this.modelList[name] = model;
                //console.log(this.modelList);
              } else if ( style.indexOf("{") && style.indexOf("}") && style.indexOf("{") < style.indexOf("}") ) {
                console.log('aa');
                var start,end,model;
                start = style.indexOf("{") + 1;
                end = style.indexOf("}");
                model = replaceSpace(style.slice(start,end));
                style = replaceSpace(style.slice(0,start - 1) + style.slice(end + 1));
                this.modelList[name] = model;
              }


              if (style.indexOf('&') > 0) {
                var $start = style.indexOf("&");
                var transition = replaceSpace(style.slice($start + 1));
                style = style.slice(0,$start);
                if (this.initStyle.transition) {
                  this.initStyle.transition += (',' + name + ' ' + transition);
                } else {
                  this.initStyle.transition = (name + ' ' + transition);
                }
                var trsobj = {};
                trsobj[name] = transition;
                if (this.trs) {
                  this.trs.push(trsobj);
                }else{
                  this.trs = [trsobj];
                }
              }

              this.initStyle[name] = style;
              } else {
                throwError('wrong css code');
              }
            }
          }
          } else if (typeof ObjStyle === "object") {
            for(var key in ObjStyle){
              var name,style;
              name = key;
              style = ObjStyle[key];

              if ( name.indexOf("{{") && name.indexOf("}}") && name.indexOf("{{") < name.indexOf("}}") ) {
                var start,end,model;
                start = name.indexOf("{{") + 2;
                end = name.indexOf("}}");
                model = name.slice(start,end);
                name = replaceSpace(name.slice(0,start - 2));
                this.modelList[name] = model;
                //console.log(this.modelList);
              }  else if ( style.indexOf("{") && style.indexOf("}") && style.indexOf("{") < style.indexOf("}") ) {
                var start,end,model;
                start = style.indexOf("{") + 1;
                end = style.indexOf("}");
                model = replaceSpace(style.slice(start,end));
                style = replaceSpace(style.slice(0,start - 1) + style.slice(end + 1));
                this.modelList[name] = model;
              }

              if (style.indexOf('&') > 0) {
                var $start = style.indexOf("&");
                var transition = replaceSpace(style.slice($start + 1));
                style = style.slice(0,$start);
                if (this.initStyle.transition) {
                  this.initStyle.transition += (',' + name + ' ' + transition);
                } else {
                  this.initStyle.transition = (name + ' ' + transition);
                }
                var trsobj = {};
                trsobj[name] = transition;
                if (this.trs) {
                  this.trs.push(trsobj);
                }else{
                  this.trs = [trsobj];
                }
              }

            this.initStyle[name] = style;

            }
          }

        }
        }
    }

    Anp.createComponent.prototype.newState = function (opt) {
      var newState = {};
      if (!this.state) {
        this.state = new Array();
      }
      
      if (opt.name && typeof opt.name === "string") {
        newState.name = opt.name;
      } else {
        throwError('miss state name');
      }

      if (opt.trigger && typeof opt.trigger === "object") {
        if (typeof opt.trigger.type === "string" && typeof opt.trigger.func === "function" ) {

          newState.trigger = opt.trigger;

        } else {
          throwError('wrong code');
        }
      } else {
        console.log('warning:miss trigger');
      }

      if (typeof opt.style === "string") {
        var cacheCss = opt.style.split(';');
        newState.style = {};


        for (var i in cacheCss){
          if(cacheCss[i].length > 0){
            var cache = cacheCss[i].split(':');
            var style = cache[1];
            var name = cache[0];

        if (style.indexOf('&') > 0) {
          var $start = style.indexOf("&");
          var transition = replaceSpace(style.slice($start + 1));
          style = style.slice(0,$start);

          var trsobj = {};
          trsobj[name] = transition;
          if (this.trs) {
            this.trs.push(trsobj);
          }else{
            this.trs = [trsobj];
          }
          if(this.RenderedEl){
            setTransition(this.RenderedEl,this.trs);
          }
        }

        cache.length === 2 ? newState.style[name] = style : throwError('wrong style code');
          }
        }
      }

      this.state.push(newState);
        
    }

    Anp.createComponent.prototype.addConvert = function (style,fn) {
      if ( !this.convertList ) {
        this.convertList = {};
      }

      style && fn ? this.convertList[style] = fn : throwError("miss style or fn");
    }

    Anp.createComponent.prototype.appendChild = function (opt) {
      if (opt.showSignature() === "Create by Anp") {
        opt.el = "parent" ; 
        this.child.push(opt) ;
      } else {
        throwError("error code") ;
      }
    }

    Anp.createComponent.prototype.toggle = function (state) {
      if (this.RenderedEl) {
        var RenderedEl = this.RenderedEl , nextState;
        if (state !== 'init') {
          for (var i in this.state) {
            if (this.state[i].name === state) {
              nextState = this.state[i];
              break;
            }
          }
           
          if (this.trs && this.auto) {
            var arg,reset,$style,cacheI,counter,mykey;
            for (var i in this.trs) {
              for (var key in this.trs[i]){
                mykey = key;
              }
              for (var j in nextState.style) {
                if (mykey === j) {
                  arg = mykey;
                  break;
                }
              }
            }

            counter = 0;
            $style = document.defaultView.getComputedStyle(RenderedEl,null);
            reset = $style[arg];
            cacheI = setInterval(function(){
              if ($style[arg] === nextState.style[arg] || $style[arg] === reset) {
                RenderedEl.style[arg] = reset;
                setTimeout(function(){
                  counter ++ ;
                  RenderedEl.style[arg] = nextState.style[arg];
                },5);
              } else {
                for (var key in nextState.style) {
                  if (key != arg){
                    RenderedEl.style[key] = nextState.style[key];
                  }
                }
                window.clearInterval(cacheI);
                //console.log("complete : " + counter);
              }
            },10);
          } else {
            for (var key in nextState.style) {
              RenderedEl.style[key] = nextState.style[key];
            }
          }
          if(nextState.trigger){
            bind(RenderedEl,nextState.trigger);
          }
          
        } else {
          for (var key in this.initStyle) {
            RenderedEl.style[key] = this.initStyle[key];
          }

          bind(RenderedEl,this.initTrigger);
        }
      } else {
        throwError('not yet rendered');
      }

    }
  }
 
  function registerApi (Anp) {
    var register = [];

    var registData = function (el,opt,convertFn,listenFn) {
      var body = document.getElementsByTagName("body")[0];
      this.style = [];
      this.el = document.defaultView.getComputedStyle(el.RenderedEl||el,null);

      this.listenFn = listenFn || function (model,obj,value){
        if (obj.convertFn) {
          value = obj.convertFn(value);
        }
        model.firstChild.textContent = obj.textFn(value);
      };
      for (var key in opt) {
        var newStyleObject = {
          name : key,
          lastValue : this.el[key],
          model : nodeTraversal(body,opt[key]),
          textFn : function(value){
            return this.texture[0] + value + this.texture[1];
          },
          convertFn : convertFn && convertFn[key] ? convertFn[key] : false
        };

        if (newStyleObject.model ) { 
          var textModel,start,end,textArr;
          textModel = newStyleObject.model.firstChild.textContent;
          start = textModel.indexOf("{{");
          end = textModel.indexOf("}}") + 2;
          if (start && end && start > 0 && end > 0 && end > start) {
            var modelContent = textModel.slice(start + 2,end - 2);
            if (modelContent == opt[key]) {
              start = textModel.slice(0,start);
              end = textModel.slice(end);
              textArr = [start,end];
              newStyleObject.texture = textArr;
            } else {
              throwError("wrong model");
            }
          } else {
            throwError("wrong texture");
          }
        } else {
          throwError("miss model");
        }

        this.style.push(newStyleObject);
        newStyleObject.model.firstChild.textContent = newStyleObject.convertFn ? newStyleObject.convertFn(newStyleObject.textFn(newStyleObject.lastValue)) : newStyleObject.textFn(newStyleObject.lastValue);
       // newStyleObject.model.firstChild.textContent = newStyleObject.textFn(newStyleObject.lastValue);
      }
    };

    registData.prototype.$refresh = function () {
      var length = this.style.length;
      var name,newValue,lastValue,dirty;
      while (length --) {
        name = this.style[length].name;
        newValue = this.el[name];
        lastValue = this.style[length].lastValue;
        if ( newValue !== lastValue ) {
          this.style[length].lastValue = newValue;
          this.listenFn(this.style[length].model,this.style[length],newValue);
          dirty = true;
        }
      }

      return dirty;
    }
   
    registData.prototype.refresh = function () {

      var dirty,lastDirty,counter = 10;
      var self = this;
      var cacheInterval = setInterval(function(){
        dirty = self.$refresh();
        if (!dirty && !lastDirty) {
           counter --;
           lastDirty = dirty;
        } else {
          counter = 10;
          lastDirty = false;
        }
        if (counter <= 0) {
          window.clearInterval(cacheInterval);
        }
      },20);
    }


    Anp.regist = function (el,opt,convertFn,listenFn) {
      var cache = new registData(el,opt,convertFn,listenFn),length;
  
      register.push(cache);
      length = register.length - 1;

      return function(){
        register[length].refresh();
      };
    }

  }

  function auxiliaryApi (Anp) {
    Anp.$ = function (id) {
      var cache;
      typeof id === "string" && id.indexOf("#") === 0? cache = id.slice(1) : throwError("wrong code");
      return document.getElementById(cache);
    }
  }

  function renderApi (Anp) {
    Anp.render = function (Components,reuse) {

      function buildNode (node,parent) {
        var el,$value;
        if (node.el.charAt(0) === "#") {
          var id = node.el.slice(1);
          el = document.getElementById(id);
        } else if (node.el === "parent") {
          el = parent;
        } else {
          el = document.getElementsByTagName('body')[0];
        }

        var newEl = document.createElement(node.type);
        var newNodeEl = document.createTextNode(node.text);
        newEl.appendChild(newNodeEl);

        if (node.initStyle) {
          for (var key in node.initStyle) {
            newEl.style[key] = node.initStyle[key];
          }
        }

        if (node.initTrigger) {
          $value = bind(newEl,node.initTrigger); 
          if ($value) {
            node.auto = $value;
          }
        }

        if (node.modelList) {
          node.watch = Anp.regist(newEl,node.modelList,node.convertList);
        }
        
        newEl.AnpSource = node;

        if ( node.child.length > 0 ) {
          var len = node.child.length;
          var i = 0;
          while (i < len) {
             buildNode(node.child[i],newEl);
             i++;
          }
        }
        
        el.appendChild(newEl);
        return newEl;
      }

      if (reuse) {
        var cache = clone(Components);
        for (var key in reuse) {
          if ( cache[key] ) {
            if ( key === 'initStyle' ){
              for (var i in reuse[key]) {
                cache.initStyle[i] = reuse[key][i];
              }
            } else {
              cache[key] = reuse[key];
            }
          }
        }
        cache.RenderedEl = buildNode(cache);
        return cache;
      } else if ( !Components.RenderedEl ) {
        Components.RenderedEl = buildNode(Components);
        function runAuto (node) {
          if (node.auto) {
            node.auto();
            node.RenderedEl = null;
          }
          if (node.child) {
            for (var i in node.child) {
              runAuto(node.child[i]);
            }
          }
          return;
        }
        runAuto(Components);
      } else {
        throwError("repeat");
      }
      
    }

    /*Anp.load = function (el,opt) {
      if (typeof el === "object" && typeof opt === "object") {
      } else {
        throwError("miss arg");
      }
    }*/

  }

  var Anp = Object.create({});

  createApi(Anp);
  renderApi(Anp);
  registerApi(Anp);
  auxiliaryApi(Anp);

	Anp.version = '0.0';

  return Anp;
    //Construction End
}))
