/*
  Extream Fast Forward Lite Injected script
 */
(function(){
  /* aliases */
  var loc = window.location, doc = window.document, oex = opera.extenstion;
  /* output debug string */
  var ods = (function( pkg, name ){
    return function( msg ){
      opera.postError( pkg + '::' + name + ' <' + msg + '>' );
    };
  })( 'efflite','injected.js' );

  /* onmessage */
  oex.onmessage = function( ev ) {
    var msg = ev.data, srv = ev.source, cmd = msg.cmd, payload = msg.payload;
    ods( cmd ); ods( payload );
    if ( cmd === 'req' ) {
      ods( loc );
      srv.postMessage( { 'cmd':'res', 'payload':encodeURIComponent( loc ) } );
      return;
    }
    else if ( cmd === 'res' ) {
      ods( payload );
      appendNext( payload );
      return;
    }
  };

  function appendNav(d, type, href, force){
    if ( $X('.//head/link[@rel="' + type + '"]') !== false && !force ){
      return;
    }
    var h = d.getElementsByTagName( 'head' )[ 0 ], l = d.createElement( 'link' );
    l.rel = type;
    l.href = href;
    h.appendChild( l );
  }

  function appendext( xpath ) {
    var nextUrl = $X( xpath );
    if (nextUrl !== false) {
      appendNavi( doc, 'next', nextUrl );
      return;
    }
  }
  
  // http://lowreal.net/logs/2006/03/16/1
  function $X(exp, context) {
    if (!context) {
      context = doc;
    }
    var exp = document.createExpression( exp, function (prefix) {
      var o = doc.createNSResolver(context)(prefix);
      return o ? o : (doc.contentType === "text/html")
        ? "" : "http://www.w3.org/1999/xhtml"; } ),
      result = exp.evaluate(context, XPathResult.ANY_TYPE, null );
    switch ( result.resultType ) {
      case XPathResult.STRING_TYPE : return result.stringValue;
      case XPathResult.NUMBER_TYPE : return result.numberValue;
      case XPathResult.BOOLEAN_TYPE: return result.booleanValue;
      case XPathResult.UNORDERED_NODE_ITERATOR_TYPE: {
        result = exp.evaluate( context, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
        var ret = [];
        for ( var i = 0, len = result.snapshotLength; i < len ; ++i ) {
          ret[ret.length] = result.snapshotItem(i);
        }
        return ret;
      }
    }
    return null;
  }
})();
