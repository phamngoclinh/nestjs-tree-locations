import { ApplicationExceptionInterface } from "./application-exception.interface";

export abstract class ApplicationException implements ApplicationExceptionInterface {
  code: string;
  message: string;

  constructor(code: string, message: string) {
    this.code = code;
    this.message = message;
  }
}
