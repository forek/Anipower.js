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

            if (window.removeEventListener) {
              el.removeEventListener(EventType,function(){},false);
            } else {
              throwError("wrong bowser");
            }

            el[EventType] = function (event) {
              triggers[key].call(self,event);
            }
          }
        }

        return true;
      }
  }

  var watch = function (obj,key,el,watchlist) {
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
            func(data,oldvalue,el,itsKey);
          });
          this.$value = data;
        }
      });
      obj[key] = cache;
    }
  }

  var clone = function (obj) {  
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
                o = {};  
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

  var buildInit = function (init) {
    var cache = new Object();
    if (init.style) {
      cache.style = clone(init.style);
    }

    if (init.trigger) {
      cache.trigger = clone(init.trigger);
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

  //api

  var createApi = function (Anp) {
  	Anp.create = function (cfg,el) {
      var $el           = el,
          $attr         = new Object(),
          $trs          = '',
          self          = this;
          this.style    = new Object();
          this.status   = new Array();
          this.watcher  = new Object();
          this.$el      = el;
          
      ( el && cfg && _isObject(cfg) && _isObject($el) && $el.nodeType === 1 && _isString($el.nodeName)) || throwError('wrong arg');

      $el.getAttribute('anp:style') && ($attr.style = $el.getAttribute('anp:style'));
      $el.getAttribute('anp:text')  && ($attr.text  = $el.getAttribute('anp:text'));
      (cfg && cfg.status)  && (this.status  = clone(cfg.status));
      (cfg && cfg.watcher) && (this.watcher = clone(cfg.watcher));
      (cfg && cfg.trigger) && (this.trigger = clone(cfg.trigger));

      if (cfg && cfg.style) {
        this.style = clone(cfg.style);
      } else if ($attr.style) {
        var styleArr = resolveStyle($attr.style);
        this.style = styleArr[0];
        $trs = styleArr[1];
      }

      for (var key in this.style) {
        if (_hasOwnProperty(this.style,key)) {
          var cacheArr = new Array();
          if (this.watcher) {
            for(var li in this.watcher){
              if (_hasOwnProperty(this.watcher,key) && li == key) {
                cacheArr.push(this.watcher[li]);
              }
            }
          }
          cacheArr.push(this.style.$watch);
          watch(this.style,key,$el,cacheArr);
        }
      }

      this.status.push(buildInit(this));
      $el.style.transition = $trs;
      bind.call(this,this.trigger);
  	}

    Anp.create.prototype.toggle = function (name) {
      if (_isString(name)) {
        var newStatus = new Object();

        this.status.forEach(function(status){
          if (status.name === name) {
            newStatus = status;
          }
        });

        if (newStatus.style) {
          for (var key in newStatus.style) {
            _hasOwnProperty(newStatus.style,key) && (this.style[key] = newStatus.style[key]);
          }
        }

        if (newStatus.trigger) {
          bind.call(this,newStatus.trigger);
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