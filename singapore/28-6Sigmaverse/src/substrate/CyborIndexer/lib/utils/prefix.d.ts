import { HexString } from '@gear-js/api';
/**
 * ## Get service name prefix
 * @param payload in hex string format
 * @returns Name of the service
 */
export declare function getServiceNamePrefix(payload: HexString): string;
/**
 * ## Get service name prefix and bytes length
 * @param payload in hex string format
 * @param withBytesLength flag
 * @returns Name of the service and bytes length
 */
export declare function getServiceNamePrefix(payload: HexString, withBytesLength: true): {
    service: string;
    bytesLength: number;
};
/**
 * ## Get function (or event) name prefix
 * @param payload in hex string format
 * @returns Name of the function
 */
export declare function getFnNamePrefix(payload: HexString): string;
/**
 * ## Get function (or event) name prefix and bytes length
 * @param payload in hex string format
 * @param withBytesLength flag
 * @returns Name of the function and bytes length
 */
export declare function getFnNamePrefix(payload: HexString, withBytesLength: true): {
    fn: string;
    bytesLength: number;
};
/**
 * ## Get constructor name prefix
 * @param payload in hex string format
 * @returns Name of the constructor
 */
export declare function getCtorNamePrefix(payload: HexString): string;
/**
 * ## Get constructor name prefix and bytes length
 * @param payload in hex string format
 * @param withBytesLength flag
 * @returns Name of the constructor and bytes length
 */
export declare function getCtorNamePrefix(payload: HexString, withBytesLength: true): {
    ctor: string;
    bytesLength: number;
};
