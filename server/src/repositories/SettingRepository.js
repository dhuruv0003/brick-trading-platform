const BaseRepository = require('./BaseRepository');
const Setting = require('../models/Setting');

class SettingRepository extends BaseRepository {
  constructor() {
    super(Setting);
  }

  async findPublicAsMap() {
    const settings = await this.findAll({ isPublic: true });
    return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
  }

  async findAllSorted() {
    return this.findAll({}, { sort: { group: 1, key: 1 } });
  }

  async upsert({ key, value, type, group, label, isPublic }) {
    return this.model.findOneAndUpdate(
      { key },
      { value, type, group, label, isPublic },
      { new: true, upsert: true, runValidators: true }
    );
  }
}

module.exports = new SettingRepository();
