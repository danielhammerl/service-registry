import {
  addService,
  registeredServices,
  RegisteredServiceShape,
  RegisteredServicesListShape,
} from './registeredServices';
import { FileDatabase, log, ServiceRegistryData, getConfig } from '@danielhammerl/nodejs-service-framework';

export const database = new FileDatabase<typeof registeredServices>({
  filePath: getConfig('dbFilePath'),
  validationSchema: RegisteredServicesListShape,
});

export const saveRegisteredServices = async () => {
  log('debug', 'Trying to save registered services to db');
  await database.saveData(registeredServices, { exposeExceptions: true });
  log('debug', 'Saved registered services to db');
};

export const loadRegisteredServices = async () => {
  const data = await database.getData(undefined, {});

  Object.entries(data ?? {}).forEach(([key, value]) => {
    try {
      RegisteredServiceShape.validateSync(value);
      addService((value as ServiceRegistryData).applicationName, (value as ServiceRegistryData).port);
      log('info', `Added service ${key} from db`);
    } catch (e) {
      log('error', 'Failed to load data from db', e as Error);
    }
  });
};
