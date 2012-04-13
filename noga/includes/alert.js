(function (w) {
    if (w._gat === undefined) {
        w._gat = {
            _getTracker: function () {
                return {
                    _initData: function () { },
                    _trackEvent: function () { },
                    _trackPageview: function () { },
                    _setCustomVar: function () { },
                    _setDomainName: function () { },
                    _setVer: function () { }
                };
            }
        };
    }
    if (w._gaq === undefined) {
        w._gaq = {
            push: function (arg) {
                if (arg instanceof Array) {
                    var cmd = arg[0], cmdarg = arg.slice(1);
                    if (/_link/.test(cmd)) {
                        w.location.href = cmdarg[0];
                    }
                }
            }
        };
    }
})(window);