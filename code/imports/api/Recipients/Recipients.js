import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import SimpleSchema from 'simpl-schema';

const Recipients = new Mongo.Collection('Recipients');

Recipients.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Recipients.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

const RecipientsSchema = new SimpleSchema({
  owner: {
    type: String,
    label: 'The userId that owns this recipient.', // Spooky!
  },
  name: {
    type: String,
    label: 'The name of this recipient.',
  },
  mailingAddress: {
    type: String,
    label: 'The mailing address of this recipient.',
    optional: true,
  },
  contacts: {
    type: Array,
    label: 'The contacts for this recipient.',
    min: 1,
  },
  'contacts.$': {
    type: Object,
    label: 'A contact for this recipient.',
  },
  'contacts.$._id': {
    type: String,
    label: 'The unique ID for this contact.',
    autoValue() {
      if (this.isInsert) return Random.id();
      return this.value;
    },
  },
  'contacts.$.firstName': {
    type: String,
    label: 'The first name of the contact.',
  },
  'contacts.$.lastName': {
    type: String,
    label: 'The first name of the contact.',
  },
  'contacts.$.emailAddress': {
    type: String,
    label: 'The email address of the contact.',
  },
});

Recipients.attachSchema(RecipientsSchema);

export default Recipients;
