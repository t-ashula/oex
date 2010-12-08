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
      ods(win.self);
      ods(loc.pathname.match(/.(js|css|txt|html)$/));
      ods(( head.children.length));
      ods(( body.innerHTML.indexOf('\uFFFD')));
      ods( body.children.length );
      ods( body.firstChild.tagName );
      ods( body.firstChild.innerHTML );
      return win == win.self
        && !loc.pathname.match(/.(js|css|txt|html)$/)
        && ( head && head.children.length === 0 )
        && (( body.innerHTML.indexOf('\uFFFD') !== -1) ||
            ( body.children.length === 1 && body.firstChild.tagName.match(/pre/i) && body.firstChild.innerHTML.indexOf('PK') === 0 ));
    };
    var binarray = function( data ){
      this.data_ = data;
      this.dlen_ = data.length;
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
    var isImage = function( ba ){
      var isJpeg = (function( bj ){
        var h = bj.getBytes( 0, 2 );
        return h[ 0 ] == 0xff && h[ 1 ] == 0xd8;
      })( ba );
      var isPng = (function( bp ) { 
        var h = bp.getBytes( 0, 4 );
        return h[ 0 ] == 0x89 && h[ 1 ] == 0x50 && h[ 2 ] == 0x4e && h[ 3 ] == 0x47;
      })( ba );
      return isJpeg || isPng;
    };
    if ( flooding() ) {
      getHead( loc.href, function( bary ){
        if ( isImage( bary ) ) {
          doc.body.innerHTML = '<p style="width:100%;margin:0 auto"><img src="' + loc.href + '" alt="" /></p>';
        } 
        else {
          doc.body.innerHTML = '<p><a href="' + loc.href +'">download</a></p>';
        }
      });
    }/* */
  }, false );
})();
