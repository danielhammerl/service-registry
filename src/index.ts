import { App, InitApplication } from '@danielhammerl/nodejs-service-framework';
import RegistryController from './controller/RegistryController';

InitApplication({
  serviceName: 'Service Registry',
  connectToServiceRegistry: false,
  // eslint-disable-next-line require-await
  beforeStartMethod: async (app: App): Promise<void> => {
    app.use('/registry', RegistryController);
  },
});
