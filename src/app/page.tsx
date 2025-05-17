import Link from 'next/link';
import Image from 'next/image';
import { FaUserFriends, FaCalendarAlt, FaComments, FaUsers } from 'react-icons/fa';

export default function HomePage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div className="lg:col-span-1">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                Connect, Share, and Grow Together
              </h1>
              <p className="text-xl md:text-2xl mb-8">
                Join our social network designed to help you build meaningful connections,
                participate in events, and be part of vibrant communities.
              </p>
              <div className="space-x-4">
                <Link
                  href="/auth/register"
                  className="inline-block px-6 py-3 rounded-md bg-white text-blue-700 font-medium hover:bg-gray-100 transition"
                >
                  Get Started
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-block px-6 py-3 rounded-md bg-transparent border border-white text-white font-medium hover:bg-white/10 transition"
                >
                  Sign In
                </Link>
              </div>
            </div>
            <div className="lg:col-span-1 mt-10 lg:mt-0 flex justify-center">
              <div className="relative h-80 w-80 sm:h-96 sm:w-96">
                <Image
                  src="/images/hero-illustration.svg"
                  alt="Social network illustration"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Features for Connection</h2>
            <p className="mt-4 text-xl text-gray-600">
              Everything you need to build a strong community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="text-blue-600 mb-3">
                <FaUserFriends className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Connections</h3>
              <p className="text-gray-600">
                Build your network with meaningful connections to other members in your community.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="text-blue-600 mb-3">
                <FaCalendarAlt className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Events</h3>
              <p className="text-gray-600">
                Discover and participate in events, workshops, and gatherings within your community.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="text-blue-600 mb-3">
                <FaUsers className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Circles</h3>
              <p className="text-gray-600">
                Join interest-based circles to connect with people who share your passions.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="text-blue-600 mb-3">
                <FaComments className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chat</h3>
              <p className="text-gray-600">
                Stay connected with private messaging and group chats for your circles.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Join Our Community?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create your account now and start connecting with others, joining events, and participating in community activities.
          </p>
          <div className="inline-flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-6 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              Create Account
            </Link>
            <Link
              href="/auth/login?demo=true"
              className="px-6 py-3 rounded-md bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition"
            >
              Try Demo Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
