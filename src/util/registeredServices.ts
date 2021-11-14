import * as yup from 'yup';
import { ServiceRegistryData } from '@danielhammerl/nodejs-service-framework';

export const RegisteredServiceShape = yup.object().shape({
  applicationName: yup.string().required(),
  port: yup.number().min(1).max(65536).required(),
});

let registeredServices: ServiceRegistryData[] = [];

export const isServiceRegistered = (name: ServiceRegistryData['applicationName']): boolean => {
  return !!registeredServices.find((item) => item.applicationName === name);
};

export const unregisterService = (name: ServiceRegistryData['applicationName']): boolean => {
  if (isServiceRegistered(name)) {
    registeredServices = registeredServices.filter((item) => item.applicationName === name);
    return true;
  }

  return false;
};

export const registerService = (data: ServiceRegistryData): boolean => {
  if (!isServiceRegistered(data.applicationName)) {
    return false;
  } else {
    registeredServices.push(data);
    return true;
  }
};
