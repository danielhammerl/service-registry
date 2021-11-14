import fs from 'fs';
import { addService, registeredServices, RegisteredServiceShape } from './registeredServices';
import { log, ServiceRegistryData } from '@danielhammerl/nodejs-service-framework';
const fsp = fs.promises;

const dbFilePath = '/var/tmp/danielhammerl/service-registry';

export const saveRegisteredServices = async () => {
  const data: Record<string, unknown> = {};
  await log('debug', 'Trying to save registered services to db');
  registeredServices.forEach((value, key) => {
    data[key] = {
      applicationName: value.applicationName,
      port: value.port,
    };
  });
  try {
    await fsp.writeFile(dbFilePath, JSON.stringify(data));
    await log('debug', 'Save registered services to db');
  } catch (error) {
    await log('error', 'Error in saveRegisteredServices', error as Error);
  }
};

export const loadRegisteredServices = async () => {
  try {
    if (fs.existsSync(dbFilePath)) {
      const data = JSON.parse(fs.readFileSync(dbFilePath).toString());
      if (data) {
        log('info', 'Load data from db');

        Object.entries(data).forEach(([key, value]) => {
          try {
            RegisteredServiceShape.validateSync(value);
            addService((value as ServiceRegistryData).applicationName, (value as ServiceRegistryData).port);
            log('info', `Added service ${key} from db`);
          } catch (e) {
            log('error', 'Failed to load data from db', e as Error);
          }
        });
      }
    }
  } catch (error) {
    await log('error', 'Error in loadRegisteredServices', error as Error);
  }
};
