import { App, InitApplication } from '@danielhammerl/nodejs-service-framework';
import RegistryController from './controller/RegistryController';
import { proxies } from './util/proxies';
import { paramCase } from 'change-case';
import { RequestHandler } from 'express';

InitApplication({
  serviceName: 'Service Registry',
  connectToServiceRegistry: false,
  // eslint-disable-next-line require-await
  beforeStartMethod: async (app: App): Promise<void> => {
    app.use('/register', RegistryController);
    app.use('*', function (req, res, next) {
      let thisProxy: RequestHandler | null = null;

      proxies.forEach((value, key) => {
        if (req.originalUrl.includes(paramCase(key))) {
          thisProxy = value;
        }
      });

      if (thisProxy) {
        // @ts-expect-error why ???
        thisProxy(req, res, next);
      } else {
        res.sendStatus(404);
      }
    });
  },
});
