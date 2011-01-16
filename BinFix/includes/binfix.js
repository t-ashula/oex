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
      /** win.opera.postError( pkg + '::' + name + ' <' + msg + '>' );/**/
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
    };
    binarray.prototype.getByteAt = function( i ){
      return this.data.charCodeAt( i ) & 0xff;
    };
    binarray.prototype.getBytes = function( idx, len ) {
      var i = 0, d = [];
      for (; i < len && idx + i < this.dlen; ++i ){
        d[ i ] = this.getByteAt( idx + i );
      }
      return d;
    };
    binarray.prototype._b64cs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');
    binarray.prototype.toBase64 = function(){
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
      return out.join( '' );
    };
    var baToStr = function( ba ) {
      return ba.map( function( e ){ return String.fromCharCode( e ); } ).join( '' );
    };
    var memcmp = function( lhs, rhs ) {
      var i, l;
      for ( i = 0, l = lhs.length; i < l; ++i ) {
        if ( lhs[ i ] !== rhs[ i ] ) {
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
      xhr.onreadystatechange = function() {
        var xcto = void 0;
        try{
          if ( xhr.readyState === 2 ){
            ns = ( ( xcto = xhr.getResponseHeader( XCTO ) ) && xcto.match( /nosnif/i ) );
          }
        }
        catch (x) {
        }
        if ( xhr.readyState === 4 && xhr.status === 200 ) {
          cb( new binarray( xhr.responseText ), ns );
        }
      };
    };
    var T = function( e ) {
      return doc.createTextNode( e );
    };
    var N = function() {
      var args = arguments, l = args.length, e = doc.createElement( args[ 0 ] ), as, k;
      if ( l > 1 ) {
        as = args[ 1 ];
        for ( k in as ) {
          if ( as.hasOwnProperty( k ) ) {
            e.setAttribute( k, as[ k ] );
          }
        }
        for ( k = 2; k < l; ++k ) {
          e.appendChild( args[ k ] );
        }
      }
      return e;
    };
    var handlers = {
      'image' : function( type, bary, ns ){
        if ( !!ns ) {
          handlers[ 'unknown' ]( type, bary, true );
        }
        else {
          doc.body.innerHTML = '';
          doc.body.appendChild(
            N( 'div', { 'style' : "width:100%;margin:0 auto" },
               N( 'img', { 'src' : loc.href, 'alt': "" } ),
               N( 'p', {}, T( type ) )));
        }
      }
      ,'application' : function ( type, bary, ns ) {
        if ( !!ns ) {
          handlers[ 'unknown' ]( type, bary, true );
        }
        else {
          doc.body.innerHTML = '';
          var b = N( 'button', {}, T( 'Open' ) );
          b.addEventListener( 'click', function(){ win.location = 'data:' + type + ';base64,' + bary.toBase64(); }, false );
          doc.body.appendChild(
            N( 'div', {},
              N( 'p', {}, T( 'BinFix extension detect ' + type + ' file.' ) ),
              N( 'p', {}, N( 'a', { 'href' : loc.href }, T( 'download (right click and "Save content as")' ) ) ),
              N( 'p', {}, T( 'this button does not work properly if open ' + type + ' file with plugin.' ) ),
              b
             )
          );
        }
      }
      ,'unknown' : function ( type, bary, ns ){
        doc.body.innerHTML = '';
        if ( !!ns ) {
          doc.body.appendChild(
            N( 'p', {}, N( 'strong', {}, T( 'HTTP response contains ' + XCTO + ':nosniff. So stop content-type fix.' ) ) ) );
        }
        doc.body.appendChild(
          N( 'p', {},
            N( 'p', {}, N( 'a', { 'href' : loc.href }, T( 'download (right click and "Save content as")' ) ) ) ) );
        var p = N( 'pre', {}, T( bary.data ) );
        doc.body.appendChild( p );
      }
    };
    (function(){
      var q = { 'image' : [ 'png', 'gif', 'jpeg' ] ,
                'application' : [ 'pdf','x-rar-compressed','x-msdos-program', 'x-msdownload' ] }, i;
      for (i in q) {
        if ( q.hasOwnProperty( i ) ){
          q[ i ].forEach( function( t ) { handlers[ i + '/' + t ] = handlers[ i ]; } );
        }
      }
    })();
    var guessType = function( ba ){
      return (function( b, h ){ h = b.getBytes( 0, 2 ); return memcmp( h, [ 0xff, 0xd8 ] ); })( ba )         ? 'image/jpeg' :
        (function( b, h ) { h = b.getBytes( 0, 4 ); return memcmp( h, [ 0x89, 0x50, 0x4e, 0x47 ] ); })( ba ) ? 'image/png' :
        (function( b, h ) { h = b.getBytes( 0, 4 ); return baToStr( h ) === 'GIF8'; })( ba )                 ? 'image/gif' :
        (function( b, h ) { h = b.getBytes( 0, 2 ); return baToStr( h ) === 'MZ'; })( ba )                   ? 'application/x-msdos-program' :
        (function( b, h ) { h = b.getBytes( 0, 2 ); return baToStr( h ) === 'MZ'; })( ba )                   ? 'application/x-msdownload' :
        (function( b, h ) { h = b.getBytes( 0, 5 ); return baToStr( h ) === '%PDF-'; })( ba )                ? 'application/pdf' :        
        (function( b, h ) { h = b.getBytes( 0, 4 ); return baToStr( h ) === 'Rar!' || memcmp( h, [ 0x52, 0x45, 0x7e, 0x5e ] ); })( ba ) ? 'application/x-rar-compressed' :
        'unknown';
    };
    if ( flooding() ) {
      getHead( loc.href, function( bary, nosniff ){
        var type = guessType( bary ), handler = handlers[ type ] || handlers[ 'unknown' ];
        ods( ['type:', type, 'nosniff:', !!nosniff ] );
        handler( type, bary, nosniff );
      });
    }/* */
  }, false );
})();
