import { Router } from 'express';
import { mintParent, mintChild, equipChild, unequipChild } from '../controllers/tokenController.js';

import mintParentMock from '../mocks/mintParentMock.js';
import mintChildMock from '../mocks/mintChildMock.js';
import unequipChildMock from '../mocks/unequipChildMock.js';
import equipChildMock from '../mocks/equipChildMock.js';

const token = Router();

token.post('/parent', mintParentMock, mintParent);
token.post('/child', mintChildMock, mintChild);
token.post('/equip', equipChildMock, equipChild);
token.post('/unequip', unequipChildMock, unequipChild);

export default token;
