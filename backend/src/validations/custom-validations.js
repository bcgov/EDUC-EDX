const yup = require('yup');

// Generic UUID validation method for when we have uuid's not in a proper UUID version
yup.addMethod(yup.string, 'uuid', function(message) {
  return this.test('uuid', function(value) {
    const { path } = this;
    const defaultMessage = `Invalid UUID format for ${path}`;
    const customMessage = message || defaultMessage;
    if (!value) return true; // Allow empty values if not required
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value) || this.createError({ message: customMessage });
  });
});

const uuidGeneric = (message) => yup.string().uuid(message);

module.exports = {
  uuidGeneric
};
