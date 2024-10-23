
import { v4 as uuidV4 } from 'uuid';

export function makeUniqueKey() {
	return uuidV4();
}
