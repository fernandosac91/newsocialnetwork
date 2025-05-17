'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { FaUserCircle, FaEnvelope, FaUsers, FaCalendarAlt, FaBell, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import CommunitySelector from './CommunitySelector';
import { useCommunity } from '@/lib/context/CommunityContext';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { selectedCommunity } = useCommunity();
  
  const toggleMenu = () => setMenuOpen(!menuOpen);
  
  // Determine if the path is for circles or events
  const isCirclesPath = pathname.includes('/circles');
  const isEventsPath = pathname.includes('/events');
  
  // Create dynamic community-based URLs
  const circlesUrl = selectedCommunity ? `/${selectedCommunity.name}/circles` : '/circles';
  const eventsUrl = selectedCommunity ? `/${selectedCommunity.name}/events` : '/events';
  
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Main Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-blue-600 font-bold text-xl">
                SocialNetwork
              </Link>
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4 items-center">
              {session && (
                <div className="mr-3">
                  <CommunitySelector />
                </div>
              )}
              <Link 
                href="/dashboard" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/dashboard' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href={circlesUrl} 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isCirclesPath
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Circles
              </Link>
              <Link 
                href={eventsUrl} 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isEventsPath
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Events
              </Link>
              <Link 
                href="/connections" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/connections' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Connections
              </Link>
              
              {/* Admin link - only visible to admin users */}
              {session?.user?.role === 'ADMIN' && (
                <Link 
                  href="/admin" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin' || pathname.startsWith('/admin/') 
                    ? 'bg-red-50 text-red-700' 
                    : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          
          {/* User Info and Actions */}
          <div className="hidden sm:flex items-center">
            {session ? (
              <>
                <Link
                  href="/notifications"
                  className="p-2 rounded-full text-gray-600 hover:bg-gray-100 relative"
                >
                  <FaBell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                </Link>
                <Link
                  href="/messages"
                  className="p-2 rounded-full text-gray-600 hover:bg-gray-100 mx-2"
                >
                  <FaEnvelope className="h-5 w-5" />
                </Link>
                <div className="relative ml-3">
                  <div className="flex items-center">
                    <Link href={`/profile/${session?.user?.id}`} className="flex items-center">
                      {session.user?.photo ? (
                        <div className="h-8 w-8 rounded-full overflow-hidden">
                          <Image 
                            src={session.user.photo} 
                            alt={session.user.name || 'User'} 
                            width={32} 
                            height={32}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <FaUserCircle className="h-8 w-8 text-gray-400" />
                      )}
                      <span className="ml-2 text-sm font-medium text-gray-700">{session.user?.name || 'User'}</span>
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="ml-4 p-2 rounded-full text-gray-600 hover:bg-gray-100"
                      title="Sign out"
                    >
                      <FaSignOutAlt className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link 
                  href="/auth/login" 
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  Log in
                </Link>
                <Link 
                  href="/auth/register" 
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              {menuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      {menuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1 px-4">
            {session && (
              <div className="mb-3 ml-1">
                <CommunitySelector />
              </div>
            )}
            <Link 
              href="/dashboard" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === '/dashboard' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={toggleMenu}
            >
              Dashboard
            </Link>
            <Link 
              href={circlesUrl} 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isCirclesPath
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={toggleMenu}
            >
              Circles
            </Link>
            <Link 
              href={eventsUrl} 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isEventsPath
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={toggleMenu}
            >
              Events
            </Link>
            <Link 
              href="/connections" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === '/connections' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={toggleMenu}
            >
              Connections
            </Link>
            
            {/* Admin link in mobile menu - only visible to admin users */}
            {session?.user?.role === 'ADMIN' && (
              <Link 
                href="/admin" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/admin' || pathname.startsWith('/admin/') 
                  ? 'bg-red-50 text-red-700' 
                  : 'text-red-600 hover:bg-red-50'
                }`}
                onClick={toggleMenu}
              >
                Admin
              </Link>
            )}
          </div>
          
          {/* Mobile menu user section */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            {session ? (
              <div className="px-4 space-y-3">
                <div className="flex items-center">
                  {session.user?.photo ? (
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      <Image 
                        src={session.user.photo} 
                        alt={session.user.name || 'User'} 
                        width={40} 
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <FaUserCircle className="h-10 w-10 text-gray-400" />
                  )}
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{session.user?.name || 'User'}</div>
                    <div className="text-sm font-medium text-gray-500">{session.user?.email}</div>
                  </div>
                </div>
                
                <div className="mt-3 space-y-1">
                  <Link 
                    href={`/profile/${session.user?.id}`}
                    className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 rounded-md"
                    onClick={toggleMenu}
                  >
                    Your Profile
                  </Link>
                  <Link 
                    href="/notifications"
                    className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 rounded-md"
                    onClick={toggleMenu}
                  >
                    Notifications
                  </Link>
                  <Link 
                    href="/messages"
                    className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 rounded-md"
                    onClick={toggleMenu}
                  >
                    Messages
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      toggleMenu();
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 rounded-md"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 space-y-1">
                <Link 
                  href="/auth/login"
                  className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 rounded-md"
                  onClick={toggleMenu}
                >
                  Log in
                </Link>
                <Link 
                  href="/auth/register"
                  className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 rounded-md"
                  onClick={toggleMenu}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 