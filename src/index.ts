import { App, InitApplication, log } from '@danielhammerl/nodejs-service-framework';
import RegistryController from './controller/RegistryController';
import { proxies } from './util/proxies';
import { paramCase } from 'change-case';
import { RequestHandler } from 'express';
import { loadRegisteredServices } from './util/database';
import { startServiceMonitoring } from './util/serviceMonitoring';
import { registeredServices } from './util/registeredServices';

InitApplication({
  serviceName: 'Service Registry',
  connectToServiceRegistry: false,
  hasHealthEndpoint: false,
  // eslint-disable-next-line require-await
  beforeStartMethod: async (app: App): Promise<void> => {
    await loadRegisteredServices();
    startServiceMonitoring();

    app.use('/register', RegistryController);
    app.get('/health', (req, res) => {
      const results: Promise<Response | null>[] = [];
      const keys: string[] = [];

      Object.entries(registeredServices).map(([key, value]) => {
        results.push(
          fetch(`http://localhost:${value.port}/health`)
            .then((result) => result)
            .catch(() => null)
        );
        keys.push(key);
      });

      Promise.all(results).then((responses) => {
        let healthy = true;
        const result = responses.map((value, index) => {
          const health = value?.status === 200;
          if (!health) {
            healthy = false;
          }
          return {
            service: keys[index],
            health: health ? 'OK' : 'NOK',
          };
        });
        return res.status(healthy ? 200 : 500).json(result);
      });
    });

    app.use('*', (req, res, next) => {
      log('debug', 'received request in service-registry ...');
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
