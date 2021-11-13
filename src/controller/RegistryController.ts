import express from 'express';
import { RegisteredServiceShape, registerService } from '../util/registeredServices';
import { log, ValidationException } from '@danielhammerl/nodejs-service-framework';

const router = express.Router();

router.post('/', (req, res) => {
  try {
    RegisteredServiceShape.validateSync(req.body);
  } catch (e) {
    throw new ValidationException(e as Error);
  }
  const result = registerService(req.body);
  if (result) {
    log('info', `New service registered: ${req.body.applicationName}`, {
      metadata: {
        serviceData: req.body,
      },
    });
    return res.sendStatus(200);
  } else {
    log(
      'error',
      `Service with name ${req.body.applicationName} tries to register but there is already a service called this`
    );
    return res.sendStatus(400);
  }
});

export default router;
