import { Meteor } from 'meteor/meteor';
import Recipients from './Recipients';

Meteor.methods({
  'recipients.fetch': function recipientsFetch() {
    return Recipients.find({ owner: this.userId }).fetch();
  },
});
