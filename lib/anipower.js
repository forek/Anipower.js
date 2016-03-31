/**
*Anipower.js
*ver 0.0
*https://github.com/forek/Anipower.js
*/

(function (window,factory) {
	  typeof define === 'function' && define.amd ? define(['dynamics'],factory) : window.Anp = factory(dynamics);
})(window,function (engine) {
  'use strict';

  //tools
  var _isObject = function (obj) {
    return typeof obj === 'object';
  }

  var _isString = function (str) {
    return typeof str === 'string';
  }

  var _isNumber = function (num) {
    return typeof num === 'number';
  }

  var _isArray = function (arr) {
    return arr instanceof Array;
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

  var _indexOfs = function (str,key) {
    if (_isString(str)) {
      var result = [];
      for (var i = 0;i<str.length;i++) {
        if (str.indexOf(key,i) === i) {
          result.push(i);
        }
      }
      if (result.length > 0) {
        return result;
      } else {  
        return [-1];
      }
    } else {
      return [-1];
    }
  }

  var _hasOwnProperty = function (obj,key) {
    if (_isObject(obj)) {
      return Object.prototype.hasOwnProperty.call(obj,key);
    } else {
      return false;
    }
  }

  var replaceSpace = function (str) {
    return str.replace(/\s/g,'');    
  }

  var cacheFn = function (fn) {
    var data = {};
    return function () {
      var key,i,result;
      for (i = 0;i < arguments.length;i++) {
        key += arguments[i].toString() + ',';
      }
      result = data[key];
      if (!result) {
        data[key] = result = fn.apply(this,arguments);
      }
      return result;
    }
  }

  var makeArrayFn = function (fn) {
    var args;
    return function (el) {
      if (el instanceof Array || el instanceof NodeList || el instanceof HTMLCollection) {
        var i , result = [] , length = el.length , plusminus = length <= 0;
        for ( i = 0 ; plusminus ? i > length : i < length ; plusminus ? i-- : i++) {
          var res;
          args = Array.prototype.slice.call(arguments, 1);
          args.splice(0,0,el[i]);
          result.push(fn.apply(this,args));
        }
        return result;
      } else {
        return fn.apply(this,arguments);
      }
    }
  }

  var Set = (function(){
    function SpecialObj(array) {
      if (_isArray(array)) {
        this.obj = {};
        for (var i = 0; i < array.length; i++) {
          this.obj[array[i]] = 1; 
        }
      }
    }

    SpecialObj.prototype.contains = function (property) {
      return this.obj[property] === 1;
    }

    return SpecialObj;
  })();

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
      var textList = new Array();
      for (var i = 0;i<el.childNodes.length;i++) {
        if (el.childNodes[i].firstChild && el.childNodes[i].firstChild.nodeName === "#text" ) {
          var text = el.childNodes[i].firstChild.data;
          if (_indexOf(text,'{{') >= 0) {
            textList.push(el.childNodes[i].firstChild);
          }
        }
        if (el.childNodes[i].nodeName != "#text" && el.childNodes[i].getAttribute && el.childNodes[i].getAttribute('anp:group')) {
          var classKey = el.childNodes[i].getAttribute('anp:group'),
              cfgObj = {
                childGroup:classKey,
                props:props,
                template:cfg
              };
          if (cfg && cfg[classKey]) {
            cfgObj = cfg[classKey];
            cfgObj.props = props;
            cfgObj.template = cfg;
            cfgObj.childGroup = classKey;
          }

          var cacheAnp = new Anp.create(cfgObj,el.childNodes[i]);
          childList.push(cacheAnp);
        } else {
          var result = buildChild(el.childNodes[i],cfg,props);
          if (result) {
            if (result.childList.length > 0) {
              var j = result.childList.length;
              while (j>0) {
                childList.unshift(result.childList.pop());
                j-- ;
              }
            }

            if (result.textList.length > 0) {
              var k = result.textList.length;
              while (k>0) {
                textList.push(result.textList.pop());
                k-- ;
              }
            }
          }
        }
      }
      if (childList.length > 0 || textList.length > 0) {
        return {
          childList:childList,
          textList:textList
        };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  var buildCache = function (text,left,right) {
    var _len, i, result;
    result = [text.slice(0,left[0])];
    for ( i = 0, _len = right.length; i < _len - 1; i++ ) {
      result.push(text.slice(right[i] + 2,left[i+1]));
    }
    result.push(text.slice(right[_len-1] + 2));

    return function () {
      var rt = '';
      for (var j = 0;j < result.length; j++) {
        rt += (result[j] + (arguments[j] ? arguments[j] : '') );
      }
      return rt;
    }
  }

  var editText = makeArrayFn(function(text){
    var el = text;
    text = text.data.toString();
    if (_isString(text)) {
      var index_left  = _indexOfs(text,'{{');
      var index_right = _indexOfs(text,'}}');
      if ( index_right[0] !== -1 && index_left[0] !== -1 && _isArray(index_left) && _isArray(index_right)) {
        if (index_left.length === index_right.length) {
          var result = {
            el:el,
            text:[],
            cache:buildCache(text,index_left,index_right)
          };
          for (var i = 0; i < index_left.length ; i++) {
            var textMsg = text.slice(index_left[i] + 2,index_right[i]);
            var cache = {
              _v:catchVariable(textMsg),
              msg:textMsg
            }
            result.text.push(cache);
          }
          return result;
        } else {
          throwError('wrong text');
        }
      } else {
        return null;
      }
    }
  });

  var catchVariable = function (text) {
    var _$Special  = /[a-zA-Z0-9_$]*\.[a-zA-Z0-9_$]+/g,
        _$Special2 = /[a-zA-Z0-9_$]+[\(\[]/g,
        _$String   = /['"][\s\S]+['"]/,
        _$Symbol   = /"|'|~|`|@|!|\^|&|\*|\(|\)|=|\+|-|\{|}|\[|]|\||\\|:|;|<|>|,|\.|\?|\//g,
        _$Keyword  = /[^a-zA-Z0-9_$]break[^a-zA-Z_$]|[^a-zA-Z0-9_$]do[^a-zA-Z_$]|[^a-zA-Z0-9_$]instanceof[^a-zA-Z_$]|[^a-zA-Z0-9_$]typeof[^a-zA-Z_$]|[^a-zA-Z0-9_$]case[^a-zA-Z_$]|[^a-zA-Z0-9_$]else[^a-zA-Z_$]|[^a-zA-Z0-9_$]new[^a-zA-Z_$]|[^a-zA-Z0-9_$]var[^a-zA-Z_$]|[^a-zA-Z0-9_$]catch[^a-zA-Z_$]|[^a-zA-Z0-9_$]finally[^a-zA-Z_$]|[^a-zA-Z0-9_$]return[^a-zA-Z_$]|[^a-zA-Z0-9_$]void[^a-zA-Z_$]|[^a-zA-Z0-9_$]continue[^a-zA-Z_$]|[^a-zA-Z0-9_$]for[^a-zA-Z_$]|[^a-zA-Z0-9_$]switch[^a-zA-Z_$]|[^a-zA-Z0-9_$]while[^a-zA-Z_$]|[^a-zA-Z0-9_$]function[^a-zA-Z_$]|[^a-zA-Z0-9_$]this[^a-zA-Z_$]|[^a-zA-Z0-9_$]with[^a-zA-Z_$]|[^a-zA-Z0-9_$]default[^a-zA-Z_$]|[^a-zA-Z0-9_$]if[^a-zA-Z_$]|[^a-zA-Z0-9_$]throw[^a-zA-Z_$]|[^a-zA-Z0-9_$]delete[^a-zA-Z_$]|[^a-zA-Z0-9_$]in[^a-zA-Z_$]|[^a-zA-Z0-9_$]try[^a-zA-Z_$]/g,
        _$Reserved = /[^a-zA-Z0-9_$]class[^a-zA-Z_$]|[^a-zA-Z0-9_$]enum[^a-zA-Z_$]|[^a-zA-Z0-9_$]extends[^a-zA-Z_$]|[^a-zA-Z0-9_$]super[^a-zA-Z_$]|[^a-zA-Z0-9_$]const[^a-zA-Z_$]|[^a-zA-Z0-9_$]export[^a-zA-Z_$]|[^a-zA-Z0-9_$]import[^a-zA-Z_$]|[^a-zA-Z0-9_$]implements[^a-zA-Z_$]|[^a-zA-Z0-9_$]package[^a-zA-Z_$]|[^a-zA-Z0-9_$]public[^a-zA-Z_$]|[^a-zA-Z0-9_$]interface[^a-zA-Z_$]|[^a-zA-Z0-9_$]private[^a-zA-Z_$]|[^a-zA-Z0-9_$]static[^a-zA-Z_$]|[^a-zA-Z0-9_$]let[^a-zA-Z_$]|[^a-zA-Z0-9_$]protected[^a-zA-Z_$]|[^a-zA-Z0-9_$]yield[^a-zA-Z_$]|[^a-zA-Z0-9_$][0-9][^a-zA-Z_$]/g;

    var ReExp = [_$Special,_$Special2,_$String,_$Symbol,_$Keyword,_$Reserved];

    if (_isString(text)) {
      var cache = text,arr,result = [];
      for (var i = 0;i < ReExp.length;i ++) {
        cache = cache.replace(ReExp[i],' ');
      }
      arr = cache.split(' ');
      arr.forEach(function(data){
        if (data != '') {
          result.push(data);
        }
      });
      return result;
    }
  }

  var addToWatcher = function (watcher,fn) {
    if (!watcher) {
      return watcher = fn;
    } 

    if (_isArray(watcher)) {
      return watcher.push(fn);
    } else {
      return watcher = [watcher,fn];
    }
  }

  var watchText = function (obj, self) {
    return function () {
      var args, result;
      args = [];
      obj.text.forEach(function(t) {
        var value = null;
        value = eval('(function(){ return ' + t.msg + '; }).call(self)');
        console.log(t.msg + ':' + value);
        args.push(value);
      })
      result = obj.cache.apply(self,args);
      return obj.el.data = result;
    }
  }
  //api

  var modelTemplate = function (key) {
    this.trigger = {
      change:function(){
        console.log('change:' + this.$el.value);
        if (this.props.data) this.props.data[key] = this.$el.value;
      }
    }
  }

  window.m = modelTemplate;

  var watcheApi = function (Anp) {
    var Watch;

    Watch = (function(){
      function _Watch () {};

      _Watch.prototype.freeId = [];

      _Watch.prototype.watchList = [];

      _Watch.prototype.create = function (id) {
        if (_isNumber(id)) {
          this.bind(id);
        } else if (_isArray(id)){
          var self = this;
          id.forEach(function (data) {
            self.bind(data);
          });
        }
      }

    _Watch.prototype.bind = function (id) {
      var cfg = this.watchList[id];
      var cache = cfg.tar[cfg.key];
      cfg.$value = undefined;
      Object.defineProperty(cfg.tar, cfg.key, {
        get:function () {
          return cfg.$value;
        },
        set:function (data) {
          var oldvalue = cfg.$value;
          cfg.$value = data;
          if (oldvalue !== data) {
            cfg.func.forEach(function(func){
              func.apply(cfg.self,[data,oldvalue,cfg.el,cfg.key]);
            }); 
          }
        }
      });
      cfg.tar[cfg.key] = cache;
      return id;
    }

    _Watch.prototype.addFunctions = function (tar,key,el,funcList,self) {
      if (_isArray(funcList)) {
        var obj = {
          func:funcList,
          el:el,
          key:key,
          tar:tar,
          alive:true,
          self:self
        };
        if (this.freeId.length === 0) {
          this.watchList.push(obj);
          return this.watchList.length - 1;
        } else {
          var id = freeId.pop();
          this.watchList[id] = obj;
          return id;
        }
      }
    }

    _Watch.prototype.addTo = function (id,func) {
      this.watchList[id].func.push(func);
      return id;
    }
    
    _Watch.prototype.unBind = function (id) {
      var cfg = this.watchList[id];
      Object.defineProperty(cfg.self,cfg.key,{
        get:function () {
          return this.$value;
        },
        set:function (data) {
          this.$value = data;
        }
      });
      return id;
    }

    _Watch.prototype.remove = function (id) {
      this.unBind(id);
      if (id == this.watchList.length - 1) {
        this.watchList.pop();
        return id;
      } else {
        this.watchList[id] = null;
        this.freeId.push(id);
        return id;
      }
    };

      return _Watch;

    })();

    Anp.watch = new Watch();
  }

  var converterApi = function (Anp) {
    Anp.animate = function (el, properties, cb) {
      if (properties['z-index']) {
        return el.style['z-index'] = properties['z-index'];
      }
      var dynamics = Anp.default.engine;
      dynamics.stop(el, {
      timeout: false
    });
      var options = {
        type: dynamics.easeInOut
      };
      if (cb) {
        options.complete = cb;
      }
      return dynamics.animate(el, properties, options);
    }
  }

  var createApi = function (Anp) {
  	Anp.create = function (cfg,el) {
          this.style     = new Object();
          this.status    = cfg.status  ? clone(cfg.status)  : new Array();
          this.watcher   = cfg.watcher ? clone(cfg.watcher) : new Object();
          this.props     = cfg.props ? cfg.props : new Object();
          this.nowStatus = 'init';
          this.$el       = el;
          this.watchList = {};
          this.childList = new Object();
          this.props.children  = this.props.children ? this.props.children : new Object();
          this.isChlid   = cfg.childGroup ? true : false ;
      var $el            = el,
          $attr          = new Object(),
          $trs           = '',
          $c_tList       = new Object(),
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

      this.props.$top = cfg.props ? cfg.props : this;
    
      $c_tList = buildChild($el,$template,$props);

      if ($c_tList && $c_tList.childList.length > 0) {
        var classSet = new Object();
        $c_tList.childList.forEach(function (obj) {
          classSet[obj.childGroup] = true;
        });
        for (var key in classSet) {
          this.childList[key] = new Array();
            for (var i = 0 ; i < $c_tList.childList.length ; i++) {
              if ($c_tList.childList[i].childGroup === key) {
                this.childList[key].push($c_tList.childList[i]);
                $c_tList.childList[i].childNum = this.childList[key].length - 1;
              }
            }
          this.props.children[key] = this.childList[key];
        }
      }

      if (cfg.data) {
        this.props.data = clone(cfg.data);
      }

      if ($c_tList && $c_tList.textList.length > 0) {
        this.evalList = editText($c_tList.textList);
        this.evalList.forEach(function(obj){
          obj.text.forEach(function(text){
            text._v.forEach(function(key){
              if (!(key in self.props.data)) {
                self.props.data[key] = null;
                self.watcher[key] = watchText(obj, self);
              } else {
                if (key in self.watcher) {
                  addToWatcher(self.watcher[key],watchText(obj, self));
                } else {
                  self.watcher[key] = watchText(obj, self);
                }
              }
              text.msg = text.msg.replace(key,'this.props.data.' + key);
            });
          });
        });
      }

      if (cfg.childGroup) {
        this.childGroup = cfg.childGroup;
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
            if (key in this.watcher) {
              cacheArr.push(this.watcher[key]);
            }
          }
          cacheArr.push(this.style.$watch);
          this.watchList[key] = Anp.watch.addFunctions(this.style,key,$el,cacheArr,self);
        }
      }

      if ( !this.isChlid ) {
        for (var key in this.props.data) {
          if (_hasOwnProperty(this.props.data,key) && this.watcher) {
            if (key in this.watcher) {
              var _w;
              _w = _isArray(this.watcher[key]) ? this.watcher[key] : [this.watcher[key]];
              this.watchList[key] = Anp.watch.addFunctions(this.props.data,key,$el,_w,self);
            }
          }
        }
      }

      for (var key in this.watchList) {
        Anp.watch.bind(this.watchList[key]);
      }
      
      this.$run = this.status[0].running ? this.status[0].running.call(self) : null;
      //$el.style.transition = $trs;
      bind.call(this,$trigger);
  	}

    Anp.createWatchList = function (cfg,self) {
      var cacheWatchList;
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

       // Anp.animate(this.$el,this.)

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
      var properties = {};
      properties[key] = value;
      var a = Anp.animate(el,properties);
      //el.style[key] = value;
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

  Anp.default = {
    engine:engine
  }

  converterApi(Anp);
  watcheApi(Anp);
  createApi(Anp);
  auxiliaryApi(Anp);

  return Anp;

});