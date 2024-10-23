use sp_runtime::generic::CheckedExtrinsic;

pub trait ReplaceSender {
    type AccountId;

    fn replace_sender(&mut self, sender: Self::AccountId);
}

impl<AccountId, Call, Extra> ReplaceSender for CheckedExtrinsic<AccountId, Call, Extra> {
    type AccountId = AccountId;

    fn replace_sender(&mut self, sender: Self::AccountId) {
        match &mut self.signed {
            Some((account_id, _)) => {
                *account_id = sender;
            }
            None => { /* do nothing */ }
        }
    }
}
