mod messages;
mod results;
mod roles;
mod test_cases;
pub(crate) mod tests;

pub use messages::*;
pub use results::*;
pub use roles::*;
pub use test_cases::*;
pub use tests::{TransactionAssertContext, TransactionTestCase};

/// A special configuration trait for types that need to be configured before they can be used.
/// Such types are typically constructed from state that cannot be known ahead of time.
pub trait FromState<S: sov_modules_api::Spec> {
    /// The type created by the [`FromState::from_state`] function.
    type Output;

    /// Executes the configuration logic and returns the configured output type.
    fn from_state(
        self: Box<Self>,
        state: &mut sov_modules_api::ApiStateAccessor<S>,
    ) -> Self::Output;
}
