/*
  Extream Fast Forward Lite Injected script
*/
(function(){
  /* aliases */
  var win = window, loc = win.location, doc = win.document, oex = opera.extension,
    enc = win.encodeURIComponent, dec = win.decodeURIComponent, XPathResult = win.XPathResult;
  win.addEventListener('DOMContentLoaded', function(){
    /* output debug string */
    var ods = (function( pkg, name ){
      return function( msg ){
        /**/ window.opera.postError( pkg + '::' + name + ' <' + msg + '>' );/**/
      };
    })( 'efflite','injected.js' );
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
    function appendNext( xpath ) {
      var nextUrl = $X( xpath );
      if ( nextUrl != false ) {
        ods( 'appendNext' + xpath + ' ' + nextUrl );
        appendNavi( doc, 'next', nextUrl );
        return;
      }
    }
    function appendNavi( d, type, href, force ){
      if ( $X( './/head/link[@rel="' + type + '"]', d ) != false ){
        ods('already exist');
        return;
      }
      var h = d.getElementsByTagName( 'head' )[ 0 ], l = d.createElement( 'link' );
      l.rel = type;
      l.href = href;
      h.appendChild( l );
    }
    // http://lowreal.net/logs/2006/03/16/1
    function $X( x, context ) {
      context = context || doc;
      var exp = document.createExpression( x, function ( prefix ) {
        var o = doc.createNSResolver( context )( prefix );
        return o ? o : ( doc.contentType === "text/html" ) ? "" : "http://www.w3.org/1999/xhtml"; } ),
        result = exp.evaluate( context, XPathResult.ANY_TYPE, null );
      switch ( result.resultType ) {
       case XPathResult.STRING_TYPE : return result.stringValue;
       case XPathResult.NUMBER_TYPE : return result.numberValue;
       case XPathResult.BOOLEAN_TYPE: return result.booleanValue;
       case XPathResult.UNORDERED_NODE_ITERATOR_TYPE: {
         result = exp.evaluate( context, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
         var ret = [];
         for ( var i = 0, len = result.snapshotLength; i < len ; ++i ) {
           ret[ ret.length ] = result.snapshotItem( i );
         }
         return ret;
       }
      }
      return null;
    }
    
    if ( !isOwner() ){
      return;
    }
    /* onmessage */
    oex.onmessage = function( ev ) {
      var msg = ev.data, srv = ev.source, cmd = msg.cmd, payload = msg.payload;
      ods( 'cmd:' + cmd ); ods( 'pay:' + payload );
      if ( cmd === 'req' ) {
        srv.postMessage( { 'cmd' : 'res', 'payload' : enc( loc ) } );
        return;
      }
      else if ( cmd === 'res' ) {
        appendNext( payload.next );
        return;
      }
    };
  }, false );
})();