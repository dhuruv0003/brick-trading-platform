const settingRepository = require('../repositories/SettingRepository');

class SettingsService {
  async getPublicAsMap() {
    return settingRepository.findPublicAsMap();
  }

  async listAll() {
    return settingRepository.findAllSorted();
  }

  async upsert(payload) {
    return settingRepository.upsert(payload);
  }
}

module.exports = new SettingsService();
