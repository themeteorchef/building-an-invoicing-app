import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Recipients from '../Recipients';

Meteor.publish('recipients', function recipients() {
  return Recipients.find({ owner: this.userId }, { sort: { name: 1 } });
});

Meteor.publish('recipients.view', function recipientsView(recipientId) {
  check(recipientId, String);
  return Recipients.find({ _id: recipientId, owner: this.userId });
});
