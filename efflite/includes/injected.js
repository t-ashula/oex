/*
  Extream Fast Forward Lite Injected script
*/
(function(){
  window.addEventListener( 'DOMContentLoaded', function(){
    /* aliases */
    var win = window, loc = win.location, doc = win.document, oex = opera.extension,
      enc = win.encodeURIComponent, dec = win.decodeURIComponent, XPathResult = win.XPathResult;
    
    /* output debug string */
    var ods = (function( pkg, name ){
      return function( msg ){
        /**/ win.opera.postError( pkg + '::' + name + ' <' + msg + '>' );/**/
      };
    })( 'efflite','injected.js' );
    function isOwner(win){
      var res = true;
      try {
        res = win.top === win;
      }
      catch (x) {
        res = false;
      }
      return res;
    }
    if ( !isOwner(window) ){
      return;
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
    function getUrlFormXpath( xpath ){
      var url = $X( xpath );
      ods( 'xpath:' + xpath ); ods( 'url:' + url + ';'  );
      url = ( url instanceof Array ) ? url[ 0 ] : url;
      return typeof url === 'string' ? url : "";
    }
    function appendNavi( d, type, xpath ){
      if ( $X( './/head/link[@rel="' + type + '"]', d ) != false ){
        ods('already exist');
        return;
      }      
      var h, l, href = getUrlFormXpath( xpath );
      if ( href === "" ){
        ods('not found:' + xpath );
        return;
      }
      if ( ( h = d.getElementsByTagName( 'head' ) ) ) {
        l = d.createElement( 'link' );
        l.rel = type;
        l.href = href;
        h[ 0 ].appendChild( l );
      }
    }
    function appendNext( xpath ) {
      appendNavi( doc, 'next', xpath );
    }
    function appendPrev( xpath ){
      appendNavi( doc, 'prev', xpath );
    }
    
    /* onmessage */
    oex.onconnect = function( ev ) {
      var msg = ev.data, src = ev.source;
      src.postMessage( { 'cmd' : 'res', 'payload' : enc( loc ) } );
    };
    oex.onmessage = function( ev ) {
      var msg = ev.data, src = ev.source, cmd = msg.cmd, payload = msg.payload;
      //ods( 'cmd:' + cmd ); ods( 'pay:' + payload );
      if ( cmd === 'req' ) {
        src.postMessage( { 'cmd' : 'res', 'payload' : enc( loc ) } );
        return;
      }
      else if ( cmd === 'res' ) {
        var h = { 'next' : appendNext, 'prev' : appendPrev };
        for ( var i in h ) if ( h.hasOwnProperty( i ) ) {
          if ( !!payload[ i ] ) {
            ods( 'location:' + loc );
            ods( i + ':' + payload[i] );
            h[ i ]( payload[ i ] );
          }
        }
        return;
      }
    };
  }, false );
})();