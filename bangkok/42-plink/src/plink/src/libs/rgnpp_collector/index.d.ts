/// <reference types="@nervosnetwork/ckb-types" />
import CKB from '@nervosnetwork/ckb-sdk-core';
import { CollectConfig, CollectResult, CollectUdtResult, IndexerCell } from '../types/collector';
import { Hex } from '../types';
export declare class Collector {
    private ckbNodeUrl;
    private ckbIndexerUrl;
    constructor({ ckbNodeUrl, ckbIndexerUrl }: {
        ckbNodeUrl: string;
        ckbIndexerUrl: string;
    });
    getCkb(): CKB;
    getCells({ lock, type, isDataMustBeEmpty, outputCapacityRange, }: {
        lock?: CKBComponents.Script;
        type?: CKBComponents.Script;
        isDataMustBeEmpty?: boolean;
        outputCapacityRange?: Hex[];
    }): Promise<IndexerCell[]>;
    collectInputs(liveCells: IndexerCell[], needCapacity: bigint, fee: bigint, config?: CollectConfig): CollectResult;
    collectUdtInputs({ liveCells, needAmount }: {
        liveCells: IndexerCell[];
        needAmount: bigint;
    }): CollectUdtResult;
    getLiveCell(outPoint: CKBComponents.OutPoint, withData?: boolean): Promise<CKBComponents.LiveCell>;
}
//# sourceMappingURL=index.d.ts.map