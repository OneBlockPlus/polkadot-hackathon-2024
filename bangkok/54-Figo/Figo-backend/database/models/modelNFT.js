import { Schema, model } from 'mongoose';

const schema = new Schema(
    {
        TokenID: {
            type: String,
            required: true,
        },
        AssetType: {
            type: String,
            required: true,
        },
        EquipmentType: {
            type: String,
        },
        EquipmentSubType: {
            type: String,
        },
        ParentTokenID: {
            type: String,
        },
        DateMinted: {
            type: Date,
            default: null,
        },
        IPFS: {
            type: String,
            default: null,
        },
        Name: {
            type: String,
            required: true,
        },
        Owner: {
            type: String,
            required: true,
        },
    },
    { collection: 'collections' }
);

export default model('NFTCollection', schema);
