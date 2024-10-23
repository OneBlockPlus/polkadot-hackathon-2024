import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Link to="#" className="flex items-center gap-2 text-lg font-semibold">
          <span>Polkadot File Vault</span>
        </Link>
        <nav className="hidden gap-4 font-medium sm:flex">
          <Link to="#" className="text-gray-500">
            Dashboard
          </Link>
          <Link to="#" className="text-gray-500">
            File Manager
          </Link>
          <Link to="#" className="text-gray-500">
            Sharing
          </Link>
          <Link to="#" className="text-gray-500">
            Settings
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button className="rounded-full bg-gray-200 p-2">
  Avatar
          </button>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">My Files</h2>
            <p className="text-sm text-gray-500">Manage your files and data</p>
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Document.pdf</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2">
                    Download
                  </button>
                  <button className="p-2">
                    Share
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Image.jpg</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2">
                    Download
                  </button>
                  <button className="p-2">
                    Share
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Presentation.pptx</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2">
                    Download
                  </button>
                  <button className="p-2">
                    Share
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button className="bg-blue-500 text-white p-2 rounded">
                Upload File
              </button>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">Shared with Me</h2>
            <p className="text-sm text-gray-500">Files shared by others</p>
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Report.docx</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2">
                    Download
                  </button>
                  <button className="p-2">
                    Share
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Spreadsheet.xlsx</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2">
                    Download
                  </button>
                  <button className="p-2">
                    Share
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Proposal.pdf</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2">
                    Download
                  </button>
                  <button className="p-2">
                    Share
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button className="bg-blue-500 text-white p-2 rounded">
                View Shared Files
              </button>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">Cross-Chain Transfer</h2>
            <p className="text-sm text-gray-500">Transfer files across blockchains</p>
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Polkadot</span>
                <button className="p-2">Transfer</button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ethereum</span>
                <button className="p-2">Transfer</button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Solana</span>
                <button className="p-2">Transfer</button>
              </div>
            </div>
            <div className="mt-4">
              <button className="bg-blue-500 text-white p-2 rounded">
                Transfer File
              </button>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">Sharing</h2>
            <p className="text-sm text-gray-500">Share files securely</p>
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Share Link</span>
                <button className="p-2">Copy</button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Expiration</span>
                <button className="p-2">Set</button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">File Preview</span>
                <button className="p-2">Preview</button>
              </div>
            </div>
            <div className="mt-4">
              <button className="bg-blue-500 text-white p-2 rounded">
                Share File
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">Access Control</h2>
            <p className="text-sm text-gray-500">Manage file access permissions</p>
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">John Doe</span>
                <button className="p-2">Options</button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Jane Smith</span>
                <button className="p-2">Options</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
