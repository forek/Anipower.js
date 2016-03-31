/**
*Anipower.js
*ver 0.0
*https://github.com/forek/Anipower.js
*/

(function (window,factory) {
	  typeof define === 'function' && define.amd ? define(factory) : window.Anp = factory();
})(window,function () {
  'use strict';

  //tools

  var _isObject = function (obj) {
    return typeof obj === 'object';
  }

  var _isArray = function (arr) {
    return arr instanceof Array;
  }

  var _isString = function (str) {
    return typeof str === 'string';
  }

  var _isFunction = function (fun) {
    return typeof fun === 'function';
  }

  var _indexOf = function (str,key) {
    if (_isString(str)) {
      return str.indexOf(key);
    } else {
      return -1;
    }
  }

  var _hasOwnProperty = function (obj,key) {
    if (_isObject(obj)) {
      return Object.prototype.hasOwnProperty.call(obj,key);
    } else {
      return false;
    }
  }

  var throwError = function (err) {
     if ( typeof err === "string" ) {
      throw "Anipower.js : " + err;
    }else{
      throw "Anipower.js : unknow error";
    }
  }

  var bind = function (triggers) {
      var self = this,
          el = this.$el;

      if (_isObject(triggers)) {
        for (var key in triggers) {
          if (true) {
            var EventType = 'on' + key;

            el[EventType] = function (event) {
              triggers[key].call(self,event);
            }
          }
        }

        return true;
      }
  }

  var unBind = function (triggers) {
    var el = this.$el;
    for (var key in triggers) {
        var EventType = 'on' + key;
        el[EventType] = function (){};
        //el.removeEventListener(EventType,el[EventType],false);
    }
  }

  var watch = function (obj,key,el,watchlist,self) {
    if (_isObject(obj) && _isArray(watchlist) && key && el) {
      var cache  = obj[key];
      var itsKey = key;
      Object.defineProperty(obj, key, {
        get:function () {
          return this.$value;
        },
        set:function (data) {
          var oldvalue = this.$value;
          watchlist.forEach(function(func){
            func.apply(self,[data,oldvalue,el,itsKey]);
            //func(data,oldvalue,el,itsKey);
          });
          this.$value = data;
        }
      });
      obj[key] = cache;
    }
  }

  var clone = function (obj,con) {  
    var o;  
    switch(typeof obj){  
    case 'undefined': break;  
    case 'string'   : o = obj + '';break;  
    case 'number'   : o = obj - 0;break;  
    case 'boolean'  : o = obj;break;  
    case 'object'   :  
        if(obj === null){  
            o = null;  
        }else{  
            if(obj instanceof Array){  
                o = [];  
                for(var i = 0, len = obj.length; i < len; i++){  
                    o.push(clone(obj[i]));  
                }  
            }else{  
                o = con ? new con() : {} ; 
                for(var k in obj){
                  if (_hasOwnProperty(obj,k)) {
                    o[k] = clone(obj[k]);  
                  }
                }  
            }  
        }  
        break;  
    default:          
        o = obj;break;  
    }  
    return o;     
  }  

  var buildInit = function (init,cfg) {
    var cache = new Object();
    if (init.style) {
      cache.style = clone(init.style);
    }

    if (cfg.trigger) {
      cache.trigger = clone(cfg.trigger);
    }

    if (cfg.entering) {
      cache.entering = cfg.entering;
    }

    if (cfg.running) {
      cache.running = cfg.running;
    }

    if (cfg.leaving) {
      cache.leaving = cfg.leaving;
    }

    cache.name = 'init';

    return cache;
  }

  var resolveStyle = function (str) {
    var cacheArr   = str.split(';'),
        result     = new Anp.createStyle(),
        trs        = '';

    cacheArr.forEach(function (data) {
      if (data != '') {
        var key   = data.split(':')[0],
            value = data.split(':')[1],
            tra;
        if (value.indexOf('&')) {
          tra   = value.split('&')[1]; 
          value = value.split('&')[0];
        };
        result[key] = value; 
        if(trs === ''){
          trs += (key + ' ' + tra);
        } else {
          trs += (',' + key + ' ' + tra);
        }
      }
    });

    return [result,trs];
  }

  var buildChild = function (el,cfg,props) {
    if(el.childNodes.length > 1){
      var childList = new Array();
      for (var i = 0;i<el.childNodes.length;i++) {
        if (el.childNodes[i].nodeName != "#text" && el.childNodes[i].getAttribute && el.childNodes[i].getAttribute('anp:class')) {
          var classKey = el.childNodes[i].getAttribute('anp:class'),
              cfgObj = {
                childClass:classKey,
                props:props,
                template:cfg
              };

          if (cfg && cfg[classKey]) {
            cfgObj = cfg[classKey];
            cfgObj.props = props;
            cfgObj.template = cfg;
            cfgObj.childClass = classKey;
          }

          var cacheAnp = new Anp.create(cfgObj,el.childNodes[i]);
          childList.push(cacheAnp);
        } else {
          var result = buildChild(el.childNodes[i],cfg,props);
          if (result) {
            return result;
          }
        }
      }
      if (childList.length > 0) {
        return childList;
      }
    } else {
      return null;
    }
  }

  //api

  var createApi = function (Anp) {
  	Anp.create = function (cfg,el) {
          this.style     = new Object();
          this.status    = cfg.status  ? clone(cfg.status)  : new Array();
          this.watcher   = cfg.watcher ? clone(cfg.watcher) : new Object();
          this.props     = cfg.props ? cfg.props : new Object();
          this.nowStatus = 'init';
          this.$el       = el;
          this.childList = new Object();
          this.props.children  = this.props.children ? this.props.children : new Object();
      var $el            = el,
          $attr          = new Object(),
          $trs           = '',
          $childList     = new Array(),
          $template      = cfg.template ? cfg.template : null,
          $props         = cfg.props ? cfg.props : this.props,
          $init          = new Object(),
          $trigger       = cfg.trigger ? clone(cfg.trigger) : new Object(),
          self           = el.AnpSource = this;
          $attr.style    = $el.getAttribute('anp:style');
          $attr.text     = $el.getAttribute('anp:text');
          $attr.status   = $el.getAttribute('anp:status');

          
      ( el && cfg && _isObject(cfg) && _isObject($el) && $el.nodeType === 1 && _isString($el.nodeName)) || throwError('wrong arg');

      if (cfg.style) { 
        this.style = clone(cfg.style,Anp.createStyle);
        var trs = '';
        for (var key in this.style) {
          if (_indexOf(this.style[key],'&') >= 0) {
            if (trs == '') {
              trs += key + ' ' + this.style[key].split('&')[1];
            } else {
              trs += (',' +  key + ' ' + this.style[key].split('&')[1]);
            }

            this.style[key] = this.style[key].split('&')[0];
          }
        }
        $trs = trs;
      } else if ($attr.style) {
        var styleArr = resolveStyle($attr.style);
        this.style = styleArr[0];
        $trs = styleArr[1];
      }

      this.status.unshift(buildInit(this,cfg));

      $childList = buildChild($el,$template,$props);

      if ($childList) {
        var classSet = new Object();
        $childList.forEach(function (obj) {
          classSet[obj.childClass] = true;
        });
        for (var key in classSet) {
          this.childList[key] = new Array();
            for (var i = 0 ; i < $childList.length ; i++) {
              if ($childList[i].childClass === key) {
                this.childList[key].push($childList[i]);
                $childList[i].childNum = this.childList[key].length - 1;
              }
            }
          this.props.children[key] = this.childList[key];
        }
      }

      if (cfg.data) {
        this.props.data = clone(cfg.data);
      }

      if (!cfg.props) {
        this.props.$top = this;
      }

      if (cfg.childClass) {
        this.childClass = cfg.childClass;
      }

      if ($attr.status) {
        this.status.forEach(function(data){
          if (data.name === $attr.status && data.style) {
            for (var key in self.style) {
              if(_hasOwnProperty(self.style,key)){
                self.style[key] = data.style[key];
              }
            }
            self.nowStatus = data.name;
          }
        });
      }

      for (var key in this.style) {
        if (_hasOwnProperty(this.style,key)) {
          var cacheArr = new Array();
          if (this.watcher) {
            for(var li in this.watcher){
              if (li == key) {
                cacheArr.push(this.watcher[li]);
              }
            }
          }
          cacheArr.push(this.style.$watch);
          watch(this.style,key,$el,cacheArr,self);
        }
      }

      for (var key in this.props.data) {
        if (_hasOwnProperty(this.props.data,key) && this.watcher) {
          for (var li in this.watcher) {
            if (li == key) {
              watch(this.props.data,key,$el,[this.watcher[li]],self);
            }
          }
        }
      }

      this.$run = this.status[0].running ? this.status[0].running.call(self) : null;
      $el.style.transition = $trs;
      bind.call(this,$trigger);
  	}

    Anp.create.prototype.toggle = function (name) {
      if (_isString(name)) {
        var newStatus = new Object(),
            nowStatus = null,
            self      = this;
  
        this.status.forEach(function(status){

          if (status.name == self.nowStatus) {
            nowStatus = status;
          }

          if (status.name === name) {
            newStatus = status;
          }
        });

        self.nowStatus = newStatus.name;

        if (newStatus.style) {
          for (var key in newStatus.style) {
            _hasOwnProperty(newStatus.style,key) && (this.style[key] = newStatus.style[key]);
          }
        }

        if (nowStatus.trigger) {
          unBind.call(this,nowStatus.trigger);
        }

        if (nowStatus.leaving) {
          nowStatus.leaving.call(this);
        }

        if (nowStatus.running) {
          window.clearTimeout(this.$run);
        }

        if (newStatus.running) {
          this.$run = newStatus.running();
        }

        if (newStatus.trigger) {
          bind.call(this,newStatus.trigger);
        }

        if (newStatus.entering) {
          newStatus.entering.call(this);
        }

      }
    }

    Anp.createStyle = function(){};

    Anp.createStyle.prototype.$watch = function (value,oldvalue,el,key) {
      el.style[key] = value;
    }

  }

  function auxiliaryApi (Anp) {
    Anp.$ = function (id) {
      var cache;
      _isString(id) && _indexOf(id,'#') === 0 ? cache = id.slice(1) : throwError("wrong code");
      return document.getElementById(cache);
    }
  }

  var Anp = new Object();

  createApi(Anp);
  auxiliaryApi(Anp);

  return Anp;

});