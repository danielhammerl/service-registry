import { addService, registeredServices, RegisteredServiceShape } from './registeredServices';
import { FileDatabase, log, ServiceRegistryData } from '@danielhammerl/nodejs-service-framework';

export const database = new FileDatabase<typeof registeredServices>({ validationSchema: RegisteredServiceShape });

export const saveRegisteredServices = async () => {
  const data: Record<string, unknown> = {};
  await log('debug', 'Trying to save registered services to db');
  registeredServices.forEach((value, key) => {
    data[key] = {
      applicationName: value.applicationName,
      port: value.port,
    };
  });
  await database.saveData(registeredServices, {});
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
