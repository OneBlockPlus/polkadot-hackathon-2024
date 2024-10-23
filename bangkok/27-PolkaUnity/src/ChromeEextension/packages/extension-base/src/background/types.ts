// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-use-before-define */

import type { InjectedAccount, InjectedMetadataKnown, MetadataDef, ProviderList, ProviderMeta } from '@subwallet/extension-inject/types';
import type { KeyringPair, KeyringPair$Json, KeyringPair$Meta } from '@subwallet/keyring/types';
import type { KeyringPairs$Json } from '@subwallet/ui-keyring/types';
import type { JsonRpcResponse } from '@polkadot/rpc-provider/types';
import type { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { KeypairType } from '@polkadot/util-crypto/types';

import { CurrentNetworkInfo, KoniRequestSignatures, NetworkJson } from '@subwallet/extension-base/background/KoniTypes';

import { TypeRegistry } from '@polkadot/types';

import { ALLOWED_PATH } from '../defaults';
import { AuthUrls } from './handlers/State';

type KeysWithDefinedValues<T> = {
  [K in keyof T]: T[K] extends undefined ? never : K
}[keyof T];

type NoUndefinedValues<T> = {
  [K in KeysWithDefinedValues<T>]: T[K]
};

type IsNull<T, K extends keyof T> = { [K1 in Exclude<keyof T, K>]: T[K1] } & T[K] extends null ? K : never;

type NullKeys<T> = { [K in keyof T]: IsNull<T, K> }[keyof T];

export type SeedLengths = 12 | 24;

export interface AbstractAddressJson extends KeyringPair$Meta {
  address: string;
  type?: KeypairType;
  whenCreated?: number;
  name?: string;
}

/**
 * @interface AccountJson
 * @prop {number} [accountIndex] - Ledger's account index
 * @prop {number} [addressOffset] - Ledger's address offset
 * @prop {string[]} [availableGenesisHashes] - Ledger's availableGenesisHashes
 * @prop {string|null} [genesisHash] - Ledger's genesisHash
 * @prop {boolean} [isExternal] - Is external account
 * @prop {boolean} [isHardware] - Is hardware account
 * @prop {boolean} [isHidden] - Is hidden account
 * @prop {boolean} [isInjected] - Is injected account
 * @prop {boolean} [isGeneric] - Is generic account
 * @prop {boolean} [isMasterAccount] - Is master account - account has seed
 * @prop {boolean} [isMasterPassword] - Account has migrated with wallet password
 * @prop {boolean} [isReadOnly] - Is readonly account
 * @prop {boolean} [isReadOnly] - Is readonly account
 * @prop {boolean} [isSubWallet] - Import from SubWallet
 * @prop {boolean} [pendingMigrate] - Pending migrate password
 * @prop {string|null} [originGenesisHash] - Ledger's originGenesisHash
 * @prop {string} [source] - Account's source
 * @prop {string} [suri] - Derivate path
 * */
export interface AccountJson extends AbstractAddressJson {
  /** Ledger's account index */
  accountIndex?: number;
  /** Ledger's address offset */
  addressOffset?: number;
  /** Ledger's availableGenesisHashes */
  availableGenesisHashes?: string[];
  /** Ledger's genesisHash */
  genesisHash?: string | null;
  /** Is external account */
  isExternal?: boolean;
  /** Is hardware account */
  isHardware?: boolean;
  /** Is hidden account */
  isHidden?: boolean;
  /** Is injected account */
  isInjected?: boolean;
  /** Is generic ledger account */
  isGeneric?: boolean;
  /** Is master account - account has seed */
  isMasterAccount?: boolean;
  /** Account has migrated with wallet password */
  isMasterPassword?: boolean;
  /** Is readonly account */
  isReadOnly?: boolean;
  /** Import from SubWallet */
  isSubWallet?: boolean;
  /** Pending migrate password */
  pendingMigrate?: boolean;
  /** Ledger's originGenesisHash */
  originGenesisHash?: string | null;
  /** Parent's address */
  parentAddress?: string;
  /** Account's source */
  source?: string;
  /** Derivate path */
  suri?: string;
}

export interface AddressJson extends AbstractAddressJson {
  isRecent?: boolean;
  recentChainSlugs?: string[];
}

// all Accounts and the address of the current Account
export interface AccountsWithCurrentAddress {
  accounts: AccountJson[];
  currentAddress?: string;
}

export interface CurrentAccountInfo {
  address: string;
}

export type AccountWithChildren = AccountJson & {
  children?: AccountWithChildren[];
}

export interface FindAccountFunction{
  (networkMap: Record<string, NetworkJson>, address: string, genesisHash?: string): AccountJson | undefined;
}

export type AccountsContext = {
  accounts: AccountJson[];
  hierarchy: AccountWithChildren[];
  master?: AccountJson;
}

export type CurrentAccContext = {
  currentAccount: AccountJson | null;
  setCurrentAccount: (account: AccountJson | null) => void;
}

export type AccNetworkContext = {
  network: CurrentNetworkInfo;
  setNetwork: (network: CurrentNetworkInfo) => void;
}

export interface ConfirmationRequestBase {
  id: string;
  url: string;
  isInternal?: boolean;
}

export interface AuthorizeRequest extends ConfirmationRequestBase {
  request: RequestAuthorizeTab;
}

export interface MetadataRequest extends ConfirmationRequestBase {
  request: MetadataDef;
}

export interface SigningRequest extends ConfirmationRequestBase {
  account: AccountJson;
  request: RequestSign;
}

// [MessageType]: [RequestType, ResponseType, SubscriptionMessageType?]
export interface RequestSignatures extends KoniRequestSignatures {
  // private/internal requests, i.e. from a popup
  'pri(ping)': [null, string];
  'pri(accounts.create.external)': [RequestAccountCreateExternal, boolean];
  'pri(accounts.create.hardware)': [RequestAccountCreateHardware, boolean];
  'pri(accounts.create.suri)': [RequestAccountCreateSuri, boolean];
  'pri(accounts.edit)': [RequestAccountEdit, boolean];
  'pri(accounts.export)': [RequestAccountExport, ResponseAccountExport];
  'pri(accounts.batchExport)': [RequestAccountBatchExport, ResponseAccountsExport]
  'pri(accounts.forget)': [RequestAccountForget, boolean];
  'pri(accounts.show)': [RequestAccountShow, boolean];
  'pri(accounts.tie)': [RequestAccountTie, boolean];
  'pri(accounts.subscribe)': [RequestAccountSubscribe, AccountJson[], AccountJson[]];
  'pri(accounts.validate)': [RequestAccountValidate, boolean];
  'pri(accounts.changePassword)': [RequestAccountChangePassword, boolean];
  'pri(authorize.approve)': [RequestAuthorizeApprove, boolean];
  'pri(authorize.list)': [null, ResponseAuthorizeList];
  'pri(authorize.reject)': [RequestAuthorizeReject, boolean];
  'pri(authorize.requests)': [RequestAuthorizeSubscribe, boolean, AuthorizeRequest[]];
  'pri(authorize.toggle)': [string, ResponseAuthorizeList];
  'pri(derivation.create)': [RequestDeriveCreate, boolean];
  'pri(derivation.validate)': [RequestDeriveValidate, ResponseDeriveValidate];
  'pri(json.restore)': [RequestJsonRestore, void];
  'pri(json.batchRestore)': [RequestBatchRestore, void];
  'pri(json.validate.password)': [];
  'pri(json.account.info)': [KeyringPair$Json, ResponseJsonGetAccountInfo];
  'pri(metadata.approve)': [RequestMetadataApprove, boolean];
  'pri(metadata.get)': [string | null, MetadataDef | null];
  'pri(metadata.reject)': [RequestMetadataReject, boolean];
  'pri(metadata.requests)': [RequestMetadataSubscribe, MetadataRequest[], MetadataRequest[]];
  'pri(metadata.list)': [null, MetadataDef[]];
  'pri(seed.create)': [RequestSeedCreate, ResponseSeedCreate];
  'pri(seed.validate)': [RequestSeedValidate, ResponseSeedValidate];
  'pri(settings.notification)': [string, boolean];
  'pri(signing.approve.password)': [RequestSigningApprovePassword, boolean];
  'pri(signing.approve.signature)': [RequestSigningApproveSignature, boolean];
  'pri(signing.cancel)': [RequestSigningCancel, boolean];
  'pri(signing.isLocked)': [RequestSigningIsLocked, ResponseSigningIsLocked];
  'pri(signing.requests)': [RequestSigningSubscribe, SigningRequest[], SigningRequest[]];
  'pri(window.open)': [WindowOpenParams, boolean];
  // public/external requests, i.e. from a page
  'pub(accounts.list)': [RequestAccountList, InjectedAccount[]];
  'pub(accounts.subscribe)': [RequestAccountSubscribe, boolean, InjectedAccount[]];
  'pub(authorize.tab)': [RequestAuthorizeTab, null];
  'pub(authorize.tabV2)': [RequestAuthorizeTab, null];
  'pub(bytes.sign)': [SignerPayloadRaw, ResponseSigning];
  'pub(extrinsic.sign)': [SignerPayloadJSON, ResponseSigning];
  'pub(metadata.list)': [null, InjectedMetadataKnown[]];
  'pub(metadata.provide)': [MetadataDef, boolean];
  'pub(phishing.redirectIfDenied)': [null, boolean];
  'pub(ping)': [null, boolean];
  'pub(rpc.listProviders)': [void, ResponseRpcListProviders];
  'pub(rpc.send)': [RequestRpcSend, JsonRpcResponse<unknown>];
  'pub(rpc.startProvider)': [string, ProviderMeta];
  'pub(rpc.subscribe)': [RequestRpcSubscribe, number, JsonRpcResponse<unknown>];
  'pub(rpc.subscribeConnected)': [null, boolean, boolean];
  'pub(rpc.unsubscribe)': [RequestRpcUnsubscribe, boolean];
}

export type MessageTypes = keyof RequestSignatures;

// Requests

export type RequestTypes = {
  [MessageType in keyof RequestSignatures]: RequestSignatures[MessageType][0]
};

export type MessageTypesWithNullRequest = NullKeys<RequestTypes>

export interface TransportRequestMessage<TMessageType extends MessageTypes> {
  id: string;
  message: TMessageType;
  origin: 'page' | 'extension' | string;
  request: RequestTypes[TMessageType];
}

export type AccountAuthType = 'substrate' | 'evm' | 'both';

export interface RequestAuthorizeTab {
  origin: string;
  accountAuthType?: AccountAuthType;
  allowedAccounts?: string[]
  reConfirm?: boolean
}

export interface RequestAuthorizeApprove {
  id: string;
}

export interface RequestAuthorizeReject {
  id: string;
}

export interface RequestAuthorizeCancel {
  id: string;
}

export type RequestAuthorizeSubscribe = null;

export interface RequestMetadataApprove {
  id: string;
}

export interface RequestCurrentAccountAddress {
  address: string;
}

export interface RequestMetadataReject {
  id: string;
}

export type RequestMetadataSubscribe = null;

export interface RequestAccountCreateExternal {
  address: string;
  genesisHash?: string | null;
  name: string;
}

export interface RequestAccountCreateSuri {
  name: string;
  genesisHash?: string | null;
  password: string;
  suri: string;
  type?: KeypairType;
}

export interface RequestAccountCreateHardware {
  accountIndex: number;
  address: string;
  addressOffset: number;
  genesisHash: string;
  hardwareType: string;
  name: string;
}

export interface RequestAccountChangePassword {
  address: string;
  oldPass: string;
  newPass: string;
}

export interface RequestAccountEdit {
  address: string;
  genesisHash?: string | null;
  name: string;
}

export interface RequestAccountForget {
  address: string;
  lockAfter: boolean;
}

export interface RequestAccountShow {
  address: string;
  isShowing: boolean;
}

export interface RequestAccountTie {
  address: string;
  genesisHash: string | null;
}

export interface RequestAccountValidate {
  address: string;
  password: string;
}

export interface RequestDeriveCreate {
  name: string;
  genesisHash?: string | null;
  suri: string;
  parentAddress: string;
  parentPassword: string;
  password: string;
}

export interface RequestDeriveValidate {
  suri: string;
  parentAddress: string;
  parentPassword: string;
}

export interface RequestAccountExport {
  address: string;
  password: string;
}

export interface RequestAccountBatchExport {
  addresses: string[];
  password: string;
}

export interface RequestAccountList {
  anyType?: boolean;
  accountAuthType?: AccountAuthType
}

export interface RequestAccountSubscribe {
  accountAuthType?: AccountAuthType
}

export interface RequestAccountUnsubscribe {
  id: string
}

export interface RequestRpcSend {
  method: string;
  params: unknown[];
}

export interface RequestRpcSubscribe extends RequestRpcSend {
  type: string;
}

export interface RequestRpcUnsubscribe {
  method: string;
  subscriptionId: number | string;
  type: string;
}

export interface RequestSigningApprovePassword {
  id: string;
  password?: string;
  savePass: boolean;
}

export interface RequestSigningApproveSignature {
  id: string;
  signature: HexString;
  signedTransaction?: HexString;
}

export interface RequestSigningCancel {
  id: string;
}

export interface RequestSigningIsLocked {
  id: string;
}

export interface ResponseSigningIsLocked {
  isLocked: boolean;
  remainingTime: number;
}

export type RequestSigningSubscribe = null;

export interface RequestSeedCreate {
  length?: SeedLengths;
  seed?: string;
  type?: KeypairType;
}

export interface RequestSeedValidate {
  suri: string;
  type?: KeypairType;
}

// Responses

export type ResponseTypes = {
  [MessageType in keyof RequestSignatures]: RequestSignatures[MessageType][1]
};

export type ResponseType<TMessageType extends keyof RequestSignatures> = RequestSignatures[TMessageType][1];

interface TransportResponseMessageSub<TMessageType extends MessageTypesWithSubscriptions> {
  error?: string;
  errorCode?: number,
  errorData?: unknown,
  id: string;
  response?: ResponseTypes[TMessageType];
  subscription?: SubscriptionMessageTypes[TMessageType];
}

interface TransportResponseMessageNoSub<TMessageType extends MessageTypesWithNoSubscriptions> {
  error?: string;
  errorCode?: number,
  errorData?: unknown,
  id: string;
  response?: ResponseTypes[TMessageType];
}

export type TransportResponseMessage<TMessageType extends MessageTypes> =
  TMessageType extends MessageTypesWithNoSubscriptions
    ? TransportResponseMessageNoSub<TMessageType>
    : TMessageType extends MessageTypesWithSubscriptions
      ? TransportResponseMessageSub<TMessageType>
      : never;

export interface ResponseSigning {
  id: string;
  signature: HexString;
  signedTransaction?: HexString | Uint8Array;
}

export interface ResponseDeriveValidate {
  address: string;
  suri: string;
}

export interface ResponseSeedCreate {
  address: string;
  seed: string;
}

export interface ResponseSeedValidate {
  address: string;
  suri: string;
}

export interface ResponseAccountExport {
  exportedJson: KeyringPair$Json;
}

export interface ResponseAccountsExport {
  exportedJson: KeyringPairs$Json;
}

export type ResponseRpcListProviders = ProviderList;

// Subscriptions

export type SubscriptionMessageTypes = NoUndefinedValues<{
  [MessageType in keyof RequestSignatures]: RequestSignatures[MessageType][2]
}>;

export type MessageTypesWithSubscriptions = keyof SubscriptionMessageTypes;
export type MessageTypesWithNoSubscriptions = Exclude<MessageTypes, keyof SubscriptionMessageTypes>

export interface RequestSign {
  readonly payload: SignerPayloadJSON | SignerPayloadRaw;

  sign (registry: TypeRegistry, pair: KeyringPair): { signature: HexString };
}

export interface RequestJsonRestore {
  file: KeyringPair$Json;
  password: string;
  address: string;
}

export interface RequestBatchRestore {
  file: KeyringPairs$Json;
  password: string;
  address: string;
}

export interface ResponseJsonRestore {
  error: string | null;
}

export type AllowedPath = typeof ALLOWED_PATH[number];

export type WindowOpenParams = {
  allowedPath: AllowedPath;
  subPath?: string;
  params?: Record<string, string>;
}

export interface ResponseJsonGetAccountInfo {
  address: string;
  name: string;
  genesisHash: string;
  type: KeypairType;
}

export interface ResponseAuthorizeList {
  list: AuthUrls;
}

export interface Resolver<T> {
  reject: (error: Error) => void;
  resolve: (result: T) => void;
}
