// ==UserScript==
// @name Fix content type
// @author t.ashula
// @namespace http://ashula.info/
// ==/UserScript==
(function(){
  var win = window, loc = win.location, doc = win.document, oex = opera.extension, XHR = win.XMLHttpRequest;
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
    catch ( x ) {
      res = false;
    }
    return res;
  }
  if ( !isOwner() ){
    return;
  }
  win.addEventListener( 'load', function () {
    var flooding = function(){
      var body = doc.body, head = doc.head;
      return win == win.self
        && !loc.pathname.match(/.(js|css|txt|html)$/)
        && ( head && head.children.length === 0 )
        && (( body.innerHTML.indexOf('\uFFFD') !== -1) );
    };
    var binarray = function( data ){
      this.data = data;
      this.dlen = data.length;
      this.getByteAt = function( i ){
        return this.data.charCodeAt( i ) & 0xff;
      };
      this.getBytes = function( idx, len ) {
        var i = 0, d = [];
        for (; i < len && idx + i < this.dlen; ++i ){
          d[ i ] = this.getByteAt( idx + i );
        }
        return d;
      };
      this._b64cs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');
      this.toBase64 = function(){
        var b64ces = this._b64cs, out = [], i = 0, len = this.dlen, c, u1, u2, u3, d1, d2, d3;
        while( i < len ) {
	  c = this.getByteAt( i++ ); u1 = c >> 2; d1 = ( c & 0x03 ) << 4;
          out[ out.length ] = b64ces[ u1 ];
	  if( i === len ) {
            out[ out.length ] = b64ces[ d1 ];
            out[ out.length ] = '=='; /**/
	    break;
	  }
	  c = this.getByteAt( i++ ); u2 = ( c & 0xF0 ) >> 4; d2 = ( c & 0x0F ) << 2;
          out[ out.length ] = b64ces[ d1 | u2 ];
	  if( i === len ) {
            out[ out.length ] = b64ces[ d2 ];
            out[ out.length ] = '=';
	    break;
	  }
	  c = this.getByteAt( i++ ); u3 = ( c & 0xC0 ) >> 6; d3 = c & 0x3F;
          out[ out.length ] = b64ces[ d2 | u3 ];
          out[ out.length ] = b64ces[ d3 ];
        }
        return out.join('');
      };
    };
    var memcmp = function( lhs, rhs ) {
      var i, l;
      for ( i = 0, l = lhs.length; i < l; ++i ){
        if ( lhs[ i ] !== rhs[ i ] ){
          return false;
        }
      }
      return true;
    };
    var XCTO = 'X-Content-Type-Options';
    var getHead = function( url, cb ) {
      var xhr = new XHR(), ns;
      xhr.open( 'GET', url, true );
      xhr.setRequestHeader( 'Range', 'bytes=0-50' );
      xhr.overrideMimeType( 'text/plain; charset=x-user-defined' );
      xhr.send( null );
      xhr.onreadystatechange = function(){
        var xcto = void 0;
        try{
          if ( xhr.readyState === 2 ){
            ns = ( ( xcto = xhr.getResponseHeader( XCTO ) ) && xcto.match( /nosnif/i ) );
          }
        } catch (x) {
        }
        if ( xhr.readyState === 4 && xhr.status === 200 ){
          cb( new binarray( xhr.responseText ), ns );
        }
      };
    };
    
    var handlers = {
      'image/' : function( type, bary, ns ){
        if ( !!ns ) {
          handlers['application/octet-stream']( type, bary, true );
        }
        else {
          doc.body.innerHTML = '<div style="width:100%;margin:0 auto">'
            + '<img src="' + loc.href + '" alt="" />' + '<p>' + type + '</p>' + '</div>';            
        }
      }
      ,'application/pdf' : function ( type, bary, ns ) {
        if ( !!ns ) {
          handlers['application/octet-stream']( type, bary, true );
        }
        else {
          var b = doc.createElement('button');
          b.appendChild( doc.createTextNode('Open') );
          b.addEventListener( 'click', function(){ win.location = 'data:' + type + ';base64,' + bary.toBase64(); }, false );
          doc.body.innerHTML = '<p> BinFix extension detect ' + type + ' file </p>';
          doc.body.innerHTML += '<p><a href="' + loc.href +'">download (right click and "Save content as")</a></p>';
          doc.body.innerHTML += '<p> this button does not work if open ' + type + ' file with plugin.</p>';
          doc.body.appendChild( b );            
        }
      }
      ,'application/octet-stream' : function ( type, bary, ns ){
        doc.body.innerHTML = '';
        if ( !!ns ) {
          doc.body.innerHTML += '<p><strong style="color:red">HTTP response contains ' + XCTO + ':nosniff. So one stop content-type fix.</strong></p>';
        }
        doc.body.innerHTML += '<p><a href="' + loc.href +'">download (right click and "Save content as")</a></p>';
        var p = doc.createElement('pre');
        p.appendChild( doc.createTextNode( bary.data ) );
        doc.body.appendChild( p );
      }
    };
    handlers[ 'image/png' ] = handlers[ 'image/gif' ] = handlers[ 'image/jpeg' ] = handlers[ 'image/' ];
    handlers[ 'application/x-rar-compressed' ] = handlers[ 'application/pdf' ];
    var baToStr = function( ba ){
      var s = '', i, l;
      for ( i = 0, l = ba.length; i < l; ++i ){
        s += String.fromCharCode( ba[ i ] );
      }
      return s;
    };
    var guessType = function( ba ){
      return (function( b, h ){ h = b.getBytes( 0, 2 ); return memcmp( h, [ 0xff, 0xd8 ] ); })( ba ) ? 'image/jpeg' :
        (function( b, h ) { h = b.getBytes( 0, 4 ); return memcmp( h, [ 0x89, 0x50, 0x4e, 0x47 ] ); })( ba ) ? 'image/png' :
        (function( b, h ) { h = b.getBytes( 0, 4 ); return baToStr( h ) === 'GIF8'; })( ba )  ? 'image/gif' :
        (function( b, h ) { h = b.getBytes( 0, 5 ); return baToStr( h ) === '%PDF-'; })( ba ) ? 'application/pdf' :
        (function( b, h ) { h = b.getBytes( 0, 4 ); return baToStr( h ) === 'Rar!' || memcmp( h, [ 0x52, 0x45, 0x7e, 0x5e]); })( ba ) ? 'application/x-rar-compressed' :
        'application/octet-stream';
    };
    if ( flooding() ) {
      getHead( loc.href, function( bary, nosniff ){
        var type = guessType( bary ), handler = handlers[ type ] || handlers[ 'application/octet-stream' ];
        ods( ['type:', type, 'nosniff:', !!nosniff ] );
        handler( type, bary, nosniff );
      });
    }/* */
  }, false );
})();
