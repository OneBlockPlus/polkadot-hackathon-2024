pub struct EnsureReserve;

impl<O: Into<Result<frame_system::RawOrigin<AccountId>, O>> + From<frame_system::RawOrigin<AccountId>>>
    EnsureOrigin<O> for EnsureReserve
{
    type Success = ();
    fn try_origin(o: O) -> Result<Self::Success, O> {
        o.into().and_then(|o| match o {
            frame_system::RawOrigin::Root => Ok(()),
            r => Err(O::from(r)),
        })
    }
}