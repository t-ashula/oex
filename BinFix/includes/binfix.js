// ==UserScript==
// @name Fix content type
// @author t.ashula
// @namespace http://ashula.info/
// ==/UserScript==
(function(){
  var win = window, loc = win.location, doc = win.document, oex = opera.extension;
  /* output debug string */
  var ods = (function( pkg, name ){
    return function( msg ){
      /**/ win.opera.postError( pkg + '::' + name + ' <' + msg + '>' );/**/
    };
  })( 'binfix','binfix.js' );
  function isOwner(){
    var res = true;
    try {
      res = win.top === win;
    }
    catch (x) {
      res = false;
    }
    return res;
  }
  if ( !isOwner() ){
    return;
  }
  ods('function(w,l,c){}()');
  win.addEventListener( 'load', function () {
    var flooding = function(){
      var body = doc.body, head = doc.head;
      return win == win.self
        && !loc.pathname.match(/.(js|css|txt|html)$/)
        && ( head && head.children.length === 0 )
        && (( body.innerHTML.indexOf('\uFFFD') !== -1) ||
            ( body.children.length === 1 && body.firstChild.tagName.match(/pre/i) && body.firstChild.innerHTML.indexOf('PK') === 0 ));
    };
    var binarray = function( data ){
      this.data_ = data;
      this.dlen_ = data.length;
      this.length = function(){
        return this.dlen_;
      };
      this.getByteAt = function( i ){ return this.data_.charCodeAt( i ) & 0xff; };
      this.getBytes = function( idx, len ) {
        var i = 0, d = [];
        for (; i < len && idx + i < this.dlen_; ++i ){
          d[ i ] = this.getByteAt( idx + i );
        }
        return d;
      };
    };
    var getHead = function( url, cb ) {
      var xhr = new window.XMLHttpRequest();
      xhr.open( 'GET', url );
      xhr.setRequestHeader( 'Range', 'bytes=0-50' );
      xhr.overrideMimeType( 'text/plain; charset=x-user-defined' );
      xhr.onreadystatechange = function(){
        if ( xhr.readyState === 4 && xhr.status === 200 ){
          cb( new binarray( xhr.responseText ) );
        }
      };
      xhr.send( null );
    };
    var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var encodeBase64 = function( str ){
      var out, i, len, c1, c2, c3;
      len = str.length();
      ods('len;'+len);
      i = 0;
      out = "";
      while(i < len) {
	c1 = str.getByteAt(i++);
	if(i == len) {
	  out += base64EncodeChars.charAt(c1 >> 2);
	  out += base64EncodeChars.charAt((c1 & 0x3) << 4);
	  out += "==";
	  break;
	}
	c2 = str.getByteAt(i++);
	if(i == len) {
	  out += base64EncodeChars.charAt(c1 >> 2);
	  out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
	  out += base64EncodeChars.charAt((c2 & 0xF) << 2);
	  out += "=";
	  break;
	}
	c3 = str.getByteAt(i++);
	out += base64EncodeChars.charAt(c1 >> 2);
	out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
	out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6));
	out += base64EncodeChars.charAt(c3 & 0x3F);
      }      
      return out;
    };
    var handlers = {
      'image/' : function(type){
        doc.body.innerHTML = '<div style="width:100%;margin:0 auto">'
          + '<img src="' + loc.href + '" alt="" />' + '<p>' + type + '</p>' + '</div>';
      }
      ,'application/pdf' : function ( type, bary ) {
        var dataurl = 'data:application/pdf;base64,' + encodeBase64( bary );
        var b = doc.createElement('button');
        b.appendChild(doc.createTextNode('Open'));
        b.addEventListener('click', function(){ win.open( dataurl ); }, false);
        doc.body.innerHTML = '<p> this button does not work if open ' + type + ' with plugin.</p>';
        doc.body.appendChild( b );
      }
      ,'application/octet-stream' : function ( type ){
        doc.body.innerHTML = '<p><a href="' + loc.href +'">download (right click and "Save content as")</a></p>';
      }
    };
    handlers['image/png'] = handlers['image/gif'] = handlers['image/jpeg'] = handlers['image/'];
    var baToStr = function( ba ){
      var s = '', i, l;
      for ( i = 0, l = ba.length; i < l; ++i ){
        s += String.fromCharCode( ba[ i ] );
      }
      return s;
    };
    var guessType = function( ba ){
      return ( (function( b, h ) { h = b.getBytes( 0, 2 ); return h[ 0 ] == 0xff && h[ 1 ] == 0xd8; })( ba ) )                                   ? 'image/jpeg'
             : (function( b, h ) { h = b.getBytes( 0, 4 ); return h[ 0 ] == 0x89 && h[ 1 ] == 0x50 && h[ 2 ] == 0x4e && h[ 3 ] == 0x47; })( ba ) ? 'image/png'
             : (function( b, h ) { h = b.getBytes( 0, 5 ); return baToStr(h) === '%PDF-'; })( ba )                                               ? 'application/pdf'
             :                                                                                                                                     'application/octet-stream'
             ;
    };
    if ( flooding() ) {
      getHead( loc.href, function( bary ){
        var type = guessType( bary );
        type = ( type in handlers ) ? type : 'application/octet-stream';
        handlers[type]( type, bary );
      });
    }/* */
  }, false );
})();
