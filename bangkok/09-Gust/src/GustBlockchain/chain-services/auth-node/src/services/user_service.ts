import { UserModel } from '../model/user_model';
import { generateJwt } from '../utils/jwt_util';
import { hashPhoneNumber } from '../utils/encrypter';

export class UserService {
    private userModel = new UserModel();

    async createUser(phone_number: string) {
        const hashedPhone = hashPhoneNumber(phone_number);
        const jwt = generateJwt(hashedPhone.hashedPhoneNumber);

        return this.userModel.createUser(phone_number,hashedPhone.hashedPhoneNumber, hashedPhone.salt, jwt);
    }

    async findUserByPhoneNumber(phone_number: string) {
        // const hashedPhone = hashPhoneNumber(phone_number);
        return this.userModel.findUserByPhoneNumber(phone_number);
    }

    generateJwt(phone_number: string) {
        return generateJwt(phone_number);
    }
}
