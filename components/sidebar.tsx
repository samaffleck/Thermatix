// components/sidebar.tsx

import { Home, Folder, User, Clock, Star, AlertOctagon, Trash2, Cloud } from "lucide-react"
import Link from "next/link"

export function Sidebar() {
  function handleLinkClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    alert("This feature is under development.");
  }

  return (
    <div className="h-screen w-64 bg-gray-100 dark:bg-gray-900 p-4 flex flex-col">
      <Link href="/protected">
        <button className="my-6 px-4 py-2 bg-accent-blue hover:bg-accent-blue-hover text-accent-blue-foreground rounded-lg transition-colors">
          New Simulation
        </button>
      </Link>
      
      <ul className="space-y-2">
        <li>
          <Link href="/dashboard/my-results" className="flex items-center p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
            <Folder className="w-5 h-5 mr-3" />
            My results
          </Link>
        </li>
        <li>
          <Link href="/shared" onClick={handleLinkClick} className="flex items-center p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
            <User className="w-5 h-5 mr-3" />
            Shared with me
          </Link>
        </li>
        <li>
          <Link href="/recent" onClick={handleLinkClick} className="flex items-center p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
            <Clock className="w-5 h-5 mr-3" />
            Recent
          </Link>
        </li>
        <li>
          <Link href="/starred" onClick={handleLinkClick} className="flex items-center p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
            <Star className="w-5 h-5 mr-3" />
            Starred
          </Link>
        </li>
        <li>
          <Link href="/bin" onClick={handleLinkClick} className="flex items-center p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
            <Trash2 className="w-5 h-5 mr-3" />
            Bin
          </Link>
        </li>
        <li>
          <Link href="/membership" onClick={handleLinkClick} className="flex items-center p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
            <Cloud className="w-5 h-5 mr-3" />
            Manage subscription
          </Link>
        </li>
      </ul>
    </div>
  )
}