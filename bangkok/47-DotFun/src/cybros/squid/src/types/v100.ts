import {sts, Result, Option, Bytes, BitSequence} from './support'

export const JobResult: sts.Type<JobResult> = sts.closedEnum(() => {
    return  {
        Error: sts.unit(),
        Fail: sts.unit(),
        Panic: sts.unit(),
        Success: sts.unit(),
    }
})

export type JobResult = JobResult_Error | JobResult_Fail | JobResult_Panic | JobResult_Success

export interface JobResult_Error {
    __kind: 'Error'
}

export interface JobResult_Fail {
    __kind: 'Fail'
}

export interface JobResult_Panic {
    __kind: 'Panic'
}

export interface JobResult_Success {
    __kind: 'Success'
}

export const JobStatus: sts.Type<JobStatus> = sts.closedEnum(() => {
    return  {
        Discarded: sts.unit(),
        Pending: sts.unit(),
        Processed: sts.unit(),
        Processing: sts.unit(),
    }
})

export type JobStatus = JobStatus_Discarded | JobStatus_Pending | JobStatus_Processed | JobStatus_Processing

export interface JobStatus_Discarded {
    __kind: 'Discarded'
}

export interface JobStatus_Pending {
    __kind: 'Pending'
}

export interface JobStatus_Processed {
    __kind: 'Processed'
}

export interface JobStatus_Processing {
    __kind: 'Processing'
}

export const JobDestroyReason: sts.Type<JobDestroyReason> = sts.closedEnum(() => {
    return  {
        Completed: sts.unit(),
        Expired: sts.unit(),
        Force: sts.unit(),
        Safe: sts.unit(),
    }
})

export type JobDestroyReason = JobDestroyReason_Completed | JobDestroyReason_Expired | JobDestroyReason_Force | JobDestroyReason_Safe

export interface JobDestroyReason_Completed {
    __kind: 'Completed'
}

export interface JobDestroyReason_Expired {
    __kind: 'Expired'
}

export interface JobDestroyReason_Force {
    __kind: 'Force'
}

export interface JobDestroyReason_Safe {
    __kind: 'Safe'
}

export const ApplicableScope: sts.Type<ApplicableScope> = sts.closedEnum(() => {
    return  {
        AllowList: sts.unit(),
        Owner: sts.unit(),
        Public: sts.unit(),
    }
})

export type ApplicableScope = ApplicableScope_AllowList | ApplicableScope_Owner | ApplicableScope_Public

export interface ApplicableScope_AllowList {
    __kind: 'AllowList'
}

export interface ApplicableScope_Owner {
    __kind: 'Owner'
}

export interface ApplicableScope_Public {
    __kind: 'Public'
}

export const JobScheduler: sts.Type<JobScheduler> = sts.closedEnum(() => {
    return  {
        DemoOnly: sts.unit(),
    }
})

export type JobScheduler = JobScheduler_DemoOnly

export interface JobScheduler_DemoOnly {
    __kind: 'DemoOnly'
}

export const ImplBuildStatus: sts.Type<ImplBuildStatus> = sts.closedEnum(() => {
    return  {
        Deprecated: sts.unit(),
        Released: sts.unit(),
        Retired: sts.unit(),
    }
})

export type ImplBuildStatus = ImplBuildStatus_Deprecated | ImplBuildStatus_Released | ImplBuildStatus_Retired

export interface ImplBuildStatus_Deprecated {
    __kind: 'Deprecated'
}

export interface ImplBuildStatus_Released {
    __kind: 'Released'
}

export interface ImplBuildStatus_Retired {
    __kind: 'Retired'
}

export const BoundedVec = sts.bytes()

export const OfflineReason: sts.Type<OfflineReason> = sts.closedEnum(() => {
    return  {
        AttestationExpired: sts.unit(),
        Forced: sts.unit(),
        Graceful: sts.unit(),
        ImplBuildRetired: sts.unit(),
        InsufficientDepositFunds: sts.unit(),
        Other: sts.unit(),
        Unresponsive: sts.unit(),
    }
})

export type OfflineReason = OfflineReason_AttestationExpired | OfflineReason_Forced | OfflineReason_Graceful | OfflineReason_ImplBuildRetired | OfflineReason_InsufficientDepositFunds | OfflineReason_Other | OfflineReason_Unresponsive

export interface OfflineReason_AttestationExpired {
    __kind: 'AttestationExpired'
}

export interface OfflineReason_Forced {
    __kind: 'Forced'
}

export interface OfflineReason_Graceful {
    __kind: 'Graceful'
}

export interface OfflineReason_ImplBuildRetired {
    __kind: 'ImplBuildRetired'
}

export interface OfflineReason_InsufficientDepositFunds {
    __kind: 'InsufficientDepositFunds'
}

export interface OfflineReason_Other {
    __kind: 'Other'
}

export interface OfflineReason_Unresponsive {
    __kind: 'Unresponsive'
}

export const AttestationMethod: sts.Type<AttestationMethod> = sts.closedEnum(() => {
    return  {
        OptOut: sts.unit(),
    }
})

export type AttestationMethod = AttestationMethod_OptOut

export interface AttestationMethod_OptOut {
    __kind: 'OptOut'
}

export const AccountId32 = sts.bytes()
