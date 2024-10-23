use std::{error, fmt};

#[derive(Debug)]
pub enum Error {
	StartPflixFailed(String),
    RedirectPflixLogFailed(String),
    DetectPflixRunningStatueFailed(String),
    PreviousVersionFailed(String),
	CopyDirectory(String)
}

impl fmt::Display for Error {
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
		match self {
			Error::StartPflixFailed(e) => write!(f, "{:?}", e),
            Error::RedirectPflixLogFailed(e) => write!(f, "{:?}", e),
            Error::DetectPflixRunningStatueFailed(e) => write!(f, "{:?}", e),
			Error::PreviousVersionFailed(e) => write!(f, "{:?}", e),
			Error::CopyDirectory(e) => write!(f, "{:?}", e),
		}
	}
}

impl error::Error for Error {}
