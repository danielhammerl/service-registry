import express from 'express';
import { addService, RegisteredServiceShape } from '../util/registeredServices';
import { getConfig, log, ValidationException } from '@danielhammerl/nodejs-service-framework';
import { saveRegisteredServices } from '../util/database';

const router = express.Router();

router.post('', (req, res) => {
  log('info', 'Some service tries to register...');

  try {
    RegisteredServiceShape.validateSync(req.body);
  } catch (e) {
    throw new ValidationException(e as Error);
  }

  if (req.body.password !== getConfig('serviceRegistryPassphrase')) {
    setTimeout(() => {
      return res.status(403).send();
    }, 5000);
  } else {
    log('info', `New service registered: ${req.body.applicationName}`, {
      metadata: {
        serviceData: req.body,
      },
    });

    addService(req.body.applicationName, req.body.port);
    saveRegisteredServices();

    return res.json({ connected: true }).status(200);
  }
});

export default router;
