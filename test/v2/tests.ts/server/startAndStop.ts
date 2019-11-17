import { Test } from '../Type'

export default ((info, isValid) =>
{
    const server = info.init(1);
    const server2 = info.startServer({}, false);

    server.stop(() => {
        server2.start(info.port + 4, (httpServer) => {
            if(httpServer.address().port !== info.port + 4)
                return isValid(false, 'Wrong port');

            server2.stop(() => {
                server2.start((httpServer) => {
                    isValid(httpServer.address().port === info.port + 1, 'Wrong port');
                });
            })
        });
    });
}) as Test;
