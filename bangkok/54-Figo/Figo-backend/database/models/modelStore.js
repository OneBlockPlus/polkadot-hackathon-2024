import { Schema, model } from 'mongoose';

const schema = new Schema(
    {
        Name: {
            type: String,
            required: true,
        },
        Image: {
            type: String,
            required: true,
        },
        IPFS: {
            type: String,
            required: true,
        },
        EquipmentType: {
            type: String,
            required: true,
        },
        EquipmentSubType: {
            type: String,
            required: true,
        },
        Price: {
            type: String,
            default: null,
        },
        Owner: {
            type: String,
            required: true,
        },
    },
    { collection: 'posts' }
);

export default model('Marketplace', schema);
