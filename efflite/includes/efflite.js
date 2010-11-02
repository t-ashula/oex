// ==UserScript==
// @name        extreme fast forward lite
// @author      t.ashula
// @version     0.1
// @namespace   http://ashula.info/
// @include     http://*
// ==/UserScript==
(function(d){
  function appendNav(type,href,force){
    var h = d.getElementsByTagName( 'head' )[0];
    if ( !h || ( !force && d.querySelector('link[rel=' + type + ']') ) ){
      return;
    }
    var l = d.createElement('link');
    l.rel = type;
    l.href = href;
    h.appendChild( l );
  }
  for ( var as = d.links, a, i = 0; a = as[i]; ++i ) {
    if ( ! a.href ) {
      continue;
    }
    if ( ( a.rel && a.rel === 'next' )
         || ( a.innerText == ">>" ) || ( a.innerText.match(/新しい/) ) ) {
      appendNav('next', a.href );
    }
    if ( ( a.rel && a.rel == "prev" )
         || ( a.href && a.innerHTML == "<<" ) || ( a.innerText.match(/古い/) ) ) {
      appendNav('prev', a.href );
    }
  }
})(document);
