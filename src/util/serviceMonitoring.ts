import { log } from '@danielhammerl/nodejs-service-framework';
import { registeredServices } from './registeredServices';

const monitoringResult: Record<string, number> = {};

const monitorServices = async () => {
  log('debug', 'Check services');
  for (const value of Object.values(registeredServices)) {
    log('debug', `Monitor ${value.applicationName}`);
    let reachable = false;
    try {
      const fetchResult = await fetch(`http://localhost:${value.port}/health`);
      if (fetchResult.status === 200) {
        reachable = true;
      }
    } catch {
      reachable = false;
    }

    if (reachable) {
      monitoringResult[value.applicationName] = 0;
      log('debug', `Service ${value.applicationName} is reachable!`);
    } else {
      monitoringResult[value.applicationName] = (monitoringResult[value.applicationName] ?? 0) + 1;
      log(
        'debug',
        `Service ${value.applicationName} is not reachable! This is the ${monitoringResult[value.applicationName]}. try`
      );
    }
  }
};

export const startServiceMonitoring = () => {
  log('debug', 'Start service monitoring');
  setInterval(monitorServices, 60000);
};
