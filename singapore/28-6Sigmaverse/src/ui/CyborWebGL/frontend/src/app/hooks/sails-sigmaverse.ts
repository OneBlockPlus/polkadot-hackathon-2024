import { GearApi } from '@gear-js/api';
import { Sigmaverse } from '../../sigmaverse';
import { ADDRESS } from '../../consts';

const api = await GearApi.create({
    providerAddress: ADDRESS.NODE,
})

export const SigmaverseProgram = new Sigmaverse(api, ADDRESS.CONTRACT);