import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Recipients from './Recipients';

Meteor.methods({
  'recipients.fetch': function recipientsFetch() {
    return Recipients.find({ owner: this.userId }).fetch();
  },
  'recipients.insert': function recipientsInsert(recipent) {
    check(recipent, Object);
    return Recipients.insert({
      ...recipent,
      owner: this.userId,
    });
  },
  'recipients.update': function recipientsUpdate(recipent) {
    check(recipent, Object);
    const recipientId = recipent._id;
    const isOwner = Recipients.findOne({ _id: recipientId, owner: this.userId });

    if (isOwner) {
      Recipients.update(recipientId, { $set: recipent });
      return recipientId;
    }

    throw new Meteor.Error('500', 'Sorry, you\'re not allowed to update this!');
  },
});
