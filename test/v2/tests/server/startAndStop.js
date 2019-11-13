"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function (info, isValid) {
    var server = info.init(1);
    var server2 = info.startServer({}, false);
    server.stop(function () {
        server2.start(info.port + 4, function (httpServer) {
            if (httpServer.address().port !== info.port + 4)
                return isValid(false, 'Wrong port');
            server2.stop(function () {
                server2.start(function (httpServer) {
                    isValid(httpServer.address().port === info.port + 1, 'Wrong port');
                });
            });
        });
    });
});
