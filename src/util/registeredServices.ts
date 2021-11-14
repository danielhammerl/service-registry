import * as yup from 'yup';
import { ServiceRegistryData } from '@danielhammerl/nodejs-service-framework';

export const RegisteredServiceShape = yup.object().shape({
  applicationName: yup.string().required(),
  port: yup.number().min(1).max(65536).required(),
});

export const registeredServices = new Map<string, ServiceRegistryData>();
