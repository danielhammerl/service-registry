import express from 'express';
import { addService, registeredServices, RegisteredServiceShape } from '../util/registeredServices';
import { log, ValidationException } from '@danielhammerl/nodejs-service-framework';
import { saveRegisteredServices } from '../util/database';

const router = express.Router();

router.post('', (req, res) => {
  log('info', 'Some service tries to register...');
  try {
    RegisteredServiceShape.validateSync(req.body);
  } catch (e) {
    throw new ValidationException(e as Error);
  }
  log('info', `New service registered: ${req.body.applicationName}`, {
    metadata: {
      serviceData: req.body,
    },
  });

  addService(req.body.applicationName, req.body.port);
  saveRegisteredServices();

  return res.json({ connected: true }).status(200);
});

export default router;
