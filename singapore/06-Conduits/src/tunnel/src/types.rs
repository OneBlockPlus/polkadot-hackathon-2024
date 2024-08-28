use std::fmt::Display;
use std::str::FromStr;

#[derive(Debug, Copy, Clone, Hash, PartialEq, Eq)]
pub struct TunnelId(usize);

impl TunnelId {
    pub fn from<T: Into<usize>>(value: T) -> Self {
        TunnelId(value.into())
    }
}

impl Display for TunnelId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl FromStr for TunnelId {
    type Err = std::num::ParseIntError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        s.parse().map(TunnelId)
    }
}
