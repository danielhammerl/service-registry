import express from 'express';
import { registeredServices, RegisteredServiceShape } from '../util/registeredServices';
import { log, ValidationException } from '@danielhammerl/nodejs-service-framework';
import { proxies } from '../util/proxies';
import { paramCase } from 'change-case';
import proxy from 'express-http-proxy';

const router = express.Router();

router.post('', (req, res) => {
  log('info', 'Some service tries to register...');
  try {
    RegisteredServiceShape.validateSync(req.body);
  } catch (e) {
    throw new ValidationException(e as Error);
  }

  registeredServices.set(req.body.applicationName, req.body);

  log('info', `New service registered: ${req.body.applicationName}`, {
    metadata: {
      serviceData: req.body,
    },
  });

  const serverPrefix = `/${paramCase(req.body.applicationName)}`;

  proxies.set(
    req.body.applicationName,
    proxy(`http://localhost:${req.body.port}`, {
      proxyReqPathResolver: function (req) {
        return req.originalUrl.replace(serverPrefix, '');
      },
    })
  );

  return res.json({ connected: true }).status(200);
});

export default router;
