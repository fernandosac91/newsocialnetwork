import { FaCircle, FaUsers } from 'react-icons/fa';
import Link from 'next/link';

type Circle = {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
};

type CirclesSectionProps = {
  circles: Circle[];
  totalCount: number;
};

export default function CirclesSection({ circles, totalCount }: CirclesSectionProps) {
  // We'll show a limited number of circles in the profile page
  const displayedCircles = circles.slice(0, 4);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <FaCircle className="text-blue-600" size={16} />
          <h2 className="text-xl font-bold">Circles</h2>
          <span className="text-gray-500 text-sm">({totalCount})</span>
        </div>
        <Link 
          href="/circles" 
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          See All
        </Link>
      </div>

      {displayedCircles.length > 0 ? (
        <div className="space-y-4">
          {displayedCircles.map((circle) => (
            <Link 
              href={`/circles/${circle.id}`} 
              key={circle.id} 
              className="block p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex justify-between">
                <h3 className="font-medium">{circle.name}</h3>
                <div className="flex items-center text-gray-500 text-sm">
                  <FaUsers className="mr-1" size={14} />
                  <span>{circle.memberCount}</span>
                </div>
              </div>
              {circle.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{circle.description}</p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 italic">Not a member of any circles yet</p>
      )}

      {totalCount > displayedCircles.length && (
        <div className="mt-4 text-center">
          <Link 
            href="/circles" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View all {totalCount} circles
          </Link>
        </div>
      )}
    </div>
  );
} 