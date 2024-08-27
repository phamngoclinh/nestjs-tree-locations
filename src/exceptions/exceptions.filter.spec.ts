import { HttpExceptionFilter } from './exceptions.filter';

describe('ExceptionsFilter', () => {
  it('should be defined', () => {
    expect(new HttpExceptionFilter()).toBeDefined();
  });
});
