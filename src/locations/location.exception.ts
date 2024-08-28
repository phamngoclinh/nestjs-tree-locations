import { ApplicationException } from "@app/exceptions/application-exception.abstract";

export class LocationNotFoundException extends ApplicationException {
  constructor(message: string = 'Location is not found') {
    super('LOCATION_NOT_FOUND', message);
  }
}

export class LocationDuplicatedException extends ApplicationException {
  constructor(message: string = 'Location is duplicated') {
    super('LOCATION_DUPLICATED', message);
  }
}

export class LocationInvalidException extends ApplicationException {
  constructor(message: string = 'Location data is invalid') {
    super('LOCATION_INVALID', message);
  }
}