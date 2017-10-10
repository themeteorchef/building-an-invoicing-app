import seeder from '@cleverbeagle/seeder';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import Recipients from '../../api/Recipients/Recipients';

const recipientsSeed = (userId, faker) => ({
  collection: Recipients,
  environments: ['development', 'staging'],
  noLimit: true,
  modelCount: 5,
  model() {
    return {
      owner: userId,
      name: faker.company.companyName(),
      mailingAddress: `${faker.address.streetAddress()}\n${faker.address.city()}, ${faker.address.state()} ${faker.address.zipCode()}`,
      contacts: [{
        _id: Random.id(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        emailAddress: faker.internet.email(),
      }],
    };
  },
});

seeder(Meteor.users, {
  environments: ['development', 'staging'],
  noLimit: true,
  data: [{
    email: 'admin@admin.com',
    password: 'password',
    profile: {
      name: {
        first: 'Andy',
        last: 'Warhol',
      },
    },
    roles: ['admin'],
    data(userId, faker) {
      return recipientsSeed(userId, faker);
    },
  }],
  modelCount: 5,
  model(index, faker) {
    const userCount = index + 1;
    return {
      email: `user+${userCount}@test.com`,
      password: 'password',
      profile: {
        name: {
          first: faker.name.firstName(),
          last: faker.name.lastName(),
        },
      },
      roles: ['user'],
      data(userId) {
        return recipientsSeed(userId, faker);
      },
    };
  },
});
