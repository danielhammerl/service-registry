import { App, InitApplication, log } from '@danielhammerl/nodejs-service-framework';
import RegistryController from './controller/RegistryController';
import { proxies } from './util/proxies';
import { paramCase } from 'change-case';
import { RequestHandler } from 'express';
import { loadRegisteredServices } from './util/database';
import { startServiceMonitoring } from './util/serviceMonitoring';
import { registeredServices } from './util/registeredServices';
import fetch, { Response } from 'node-fetch';

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
      const results: Record<string, Promise<Response>> = {};

      for (const [key, value] of registeredServices) {
        results[key] = fetch(`http://localhost:${value.port}/health`);
      }

      Promise.all(Object.values(results)).then((values) => {
        let healthy = true;
        const result = values.map((value, index) => {
          const health = value?.status === 200;
          if (!health) {
            healthy = false;
          }
          return {
            service: Object.keys(results)[index],
            health: health ? 'OK' : 'NOK',
          };
        });
        return res.status(healthy ? 200 : 500).json(result);
      });
    });

    app.use('*', (req, res, next) => {
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
