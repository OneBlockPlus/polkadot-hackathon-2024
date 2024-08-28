import Community from '../models/Community';

class CommunityService {
  static async getAll() {
    return await Community.findAll();
  }

  static async getByPolkadotReferenceId(polkadotReferenceId: string) {
    return await Community.findOne({ where: { polkadotReferenceId } });
  }

  static async getBySubdomainName(subdomain: string) {
    return await Community.findOne({ where: { subdomain } });
  }

  static async create(data: Partial<Community>) {
    return await Community.create(data);
  }

  static async updateByPolkadotReferenceId(polkadotReferenceId: string, updateData: Partial<Community>) {
    const community = await Community.findOne({ where: { polkadotReferenceId } });
    if (community) {
      return await community.update(updateData);
    }
    return null;
  }

  static async deleteByPolkadotReferenceId(polkadotReferenceId: string) {
    const community = await Community.findOne({ where: { polkadotReferenceId } });
    if (community) {
      await community.destroy();
      return true;
    }
    return false;
  }

  static async deleteAll() {
    await Community.destroy({ where: {}, truncate: true });

    return null;
  }
}

export default CommunityService;
