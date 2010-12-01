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
      url = ( url[ 0 ] ) ? url[ 0 ] : url;
      return url.length < 7 ? "" : url;
    }
    function appendNavi( d, type, xpath ){
      var href = getUrlFormXpath( xpath ), head = d.getElementsByTagName( 'head' ), l;
      if ( $X( './/head/link[@rel="' + type + '"]', d ) != false ){
        ods( 'already exist' );
        return false;
      }      
      if ( href === "" ){
        ods( 'not found:' + xpath );
        return false;
      }
      if ( !head ) {
        ods( 'no head?' );
        return false;
      }

      l = d.createElement( 'link' );
      l.rel = type;
      l.href = href;
      head[ 0 ].appendChild( l );
      return true;
    }
    function appendNext( xpath ) {
      return appendNavi( doc, 'next', xpath );
    }
    function appendPrev( xpath ){
      return appendNavi( doc, 'prev', xpath );
    }
    
    /* onmessage */
    oex.onmessage = function( ev ) {
      var msg = ev.data, src = ev.source, cmd = msg.cmd, payload = msg.payload, i, info;
      //ods( 'cmd:' + cmd ); ods( 'pay:' + payload );
      switch( cmd ){
       case 'req':
        src.postMessage( { 'cmd' : 'res', 'payload' : enc( loc ) } );    
        break;
       case 'res':
        for ( i = 0; info = payload[ i ]; ++i ) {
          info.next && appendNext( info.next );
          info.prev && appendPrev( info.prev );
        }
        break;
      }
    };
  }, false );
})();