import express from 'express';
import { addService, RegisteredServiceShape, removeService } from '../util/registeredServices';
import { getConfig, log, ValidationException } from '@danielhammerl/nodejs-service-framework';
import { saveRegisteredServices } from '../util/database';
import { paramCase } from 'change-case';

const router = express.Router();

router.post('', (req, res) => {
  log('info', 'Some service tries to register...');

  try {
    RegisteredServiceShape.validateSync({
      ...req.body,
      id: req.body?.applicationName ? paramCase(req.body.applicationName) : undefined,
    });
  } catch (e) {
    log('warning', 'Prevented registering service due to invalid request');
    throw new ValidationException(e as Error);
  }

  if (req.body.password !== getConfig('serviceRegistryPassphrase')) {
    log('warning', 'Prevented registering service due to invalid serviceRegistryPassphrase');
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

    return res
      .json({ serviceName: req.body.applicationName, id: paramCase(req.body.applicationName), connected: true })
      .status(200);
  }
});

router.delete('/:id', (req, res) => {
  if (req.body.password !== getConfig('serviceRegistryPassphrase')) {
    setTimeout(() => {
      return res.status(403).send();
    }, 5000);
  } else {
    const { id } = req.params;
    log('info', `Trying to remove service ${id}`, {
      metadata: {
        serviceData: req.body,
      },
    });

    removeService(id);
    saveRegisteredServices();

    return res.sendStatus(202);
  }
});

export default router;
