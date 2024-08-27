import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly users = [
    {
      id: 1,
      username: 'admin',
      password: 'admin',
    },
    {
      id: 2,
      username: 'user',
      password: 'user',
    },
  ];

  findAll() {
    return this.users;
  }

  findOne(username: string) {
    return this.users.find(user => user.username === username);
  }
}
