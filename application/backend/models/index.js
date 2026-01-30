/**
 * Models Index
 * Export all models from a single entry point
 */

const UserModel = require('./User');
const MediaItemModel = require('./MediaItem');

module.exports = {
    UserModel,
    MediaItemModel
};
