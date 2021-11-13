import * as yup from 'yup';

export type RegisteredService = {
  applicationName: string;
  port: number;
};

export const RegisteredServiceShape = yup.object().shape({
  applicationName: yup.string().required(),
  port: yup.number().min(1).max(65536).required(),
});

let registeredServices: RegisteredService[] = [];

export const isServiceRegistered = (name: RegisteredService['applicationName']): boolean => {
  return !!registeredServices.find((item) => item.applicationName === name);
};

export const unregisterService = (name: RegisteredService['applicationName']): boolean => {
  if (isServiceRegistered(name)) {
    registeredServices = registeredServices.filter((item) => item.applicationName === name);
    return true;
  }

  return false;
};

export const registerService = (data: RegisteredService): boolean => {
  if (!isServiceRegistered(data.applicationName)) {
    return false;
  } else {
    registeredServices.push(data);
    return true;
  }
};
