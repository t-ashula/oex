/*
  Extreamm Fast Forward Lite Background Process
 */
(function(){
  /* aliases */
  var loc = window.location, doc = window.document, oex = opera.extenstion;
  /* output debug string */
  var ods = (function( pkg, name ){
    return function( msg ){
      opera.postError( pkg + '::' + name + ' <' + msg + '>' );
    };
  })( 'efflite','background.js' );

  var SITEINFO = [
    /* sample
    {
      url:      'http://www.google.*?/search*',
      nextLink: 'id("navbar")/table/tbody/tr/td[last()]/a'
    },
    */

    /* template
    {
      url:      '',
      nextLink: ''
    },
    */

    // Daily Portal Z
    {
      url:      'http://portal.nifty.com/.*/.*/.*',
      nextLink: '//td[@align="right" and @class="tx12px"]/a'
    },

    // CNET Japan
    {
      url:      'http://japan.cnet.com/.*/story/.*',
      nextLink: '(//li[@class="next"]/a)[last()]'
    },

    // @IT
    {
      url:      'http://.*.atmarkit.co.jp/.*',
      nextLink: '(//td[@align="right" and .//img[@height="17"]]//a)[last()]'
    },

    // ASCII24 Review
    {
      url:      'http://review.ascii24.com/db/review/.*',
      nextLink: '//td[@align="right" and .//img[@src="/images/nextpage.gif"]]/a'
    },

    // ASCII.jp
    {
      url:      'http://ascii.jp/elem/.*',
      nextLink: '(//a[@class="next"])[last()]'
    },

    // ITpro
    {
      url:      'http://itpro.nikkeibp.co.jp/article/COLUMN/.*',
      nextLink: '(//td[.//img[@src="/image/2006/leaf/next.gif"]]/a)[last()]'
    },

    // SAFETY JAPAN
    {
      url:      'http://www.nikkeibp.co.jp/sj/.*',
      nextLink: '(//td[@align="right" and .//img[(@width="52" and @height="22") or @src="../shared/page/next.gif"]]//a)[last()]'
    },

    // Amazon.co.jp
    {
      url:      'http://www.amazon.co.jp/.*',
      nextLink: '(//a[@class="paginationNext"])[last()]'
    },

    // jimaku.in
    {
      url:      'http://jimaku.in/',
      nextLink: '(//a[.//img[@src="http://img.jimaku.in/img/right.gif"]])[last()]'
    },

    // 怪異・妖怪伝承データベース
    {
      url:      'http://www.nichibun.ac.jp/cgi-bin/YoukaiDB/namazu.cgi.*',
      nextLink: '(//table//p[last()]/strong[last()]/following::a)[1]'
    },

    // Yahoo!画像検索
    {
      url:      'http://image-search.yahoo.co.jp/search?.*',
      nextLink: '(.//a[@title="\u6b21\u3078"])[last()]'
    },

    // Yahoo!音声検索
    {
      url:      'http://audio.search.yahoo.co.jp/bin/query?.*',
      nextLink: '(.//td//b[last()]/following::a)[1]'
    },

    // Yahoo!ニュース検索
    {
      url:      'http://nsearch.yahoo.co.jp/bin/query?.*',
      nextLink: '(.//td[@align="right" ]/a)[last()]'
    },

    // Yahoo!オークション検索
    {
      url:      'http://search.auctions.yahoo.co.jp/jp/search?.*',
      nextLink: '(//td[@align="right" and @width="1%"]/small/b[last()]/a)[last()]'
    }
  ];
  function updateEffSiteinfo(){
    
  }
  
  function getXPathForUrl( url ) {
    var defXPath = "//a";
  }
  
  /* onmessage */
  oex.onmessage = function( ev ) {
    var msg = ev.data, src = ev.source, cmd = msg.cmd, payload = msg.payload;
    ods( cmd ); ods( payload );
    if ( cmd === 'res' ) {
      ods( payload );
      src.postMessage( { 'cmd':'res', 'payload': encodeURIComponent( loc ) } );
      return;
    }
  };
  oex.onconnect = function( ev ) {
    var msg = ev.data, src = ev.source;
    ods( ev );
    src.postMessage( { 'cmd' : 'req', 'payload' : 'send back url' } );
  };
})();