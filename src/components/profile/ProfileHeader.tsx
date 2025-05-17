import { UserWithProfile } from '@/types/user';
import Image from 'next/image';
import { FaCamera, FaPencilAlt } from 'react-icons/fa';

type ProfileHeaderProps = {
  user: UserWithProfile;
  isOwnProfile: boolean;
  onEditProfile: () => void;
  onUploadImage: (type: 'profile' | 'cover') => void;
};

export default function ProfileHeader({ 
  user, 
  isOwnProfile, 
  onEditProfile,
  onUploadImage 
}: ProfileHeaderProps) {
  // Default images if not provided
  const coverImage = user.profile?.coverImage || '/images/default-cover.jpg';
  const profileImage = user.photo || '/images/default-avatar.png';

  return (
    <div className="relative w-full">
      {/* Cover Image */}
      <div className="relative w-full h-64 overflow-hidden rounded-t-lg">
        <Image
          src={coverImage}
          alt={`${user.name}'s cover`}
          className="object-cover w-full h-full"
          width={1200}
          height={300}
          priority
        />
        {isOwnProfile && (
          <button 
            className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow hover:bg-gray-100 transition"
            aria-label="Edit cover photo"
            onClick={() => onUploadImage('cover')}
          >
            <FaCamera className="text-gray-700" size={18} />
          </button>
        )}
      </div>

      {/* Profile Image */}
      <div className="absolute -bottom-16 left-8 rounded-full border-4 border-white overflow-hidden shadow-lg">
        <div className="relative w-32 h-32">
          <Image
            src={profileImage}
            alt={`${user.name}'s profile`}
            className="object-cover"
            fill
            priority
          />
          {isOwnProfile && (
            <button 
              className="absolute bottom-1 right-1 bg-white rounded-full p-2 shadow hover:bg-gray-100 transition"
              aria-label="Edit profile photo"
              onClick={() => onUploadImage('profile')}
            >
              <FaCamera className="text-gray-700" size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-end items-center w-full pl-44 pr-8 mt-4">
        {isOwnProfile ? (
          <button 
            className="flex items-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            onClick={onEditProfile}
          >
            <FaPencilAlt size={14} />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex gap-3">
            <button className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
              Connect
            </button>
            <button className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">
              Message
            </button>
          </div>
        )}
      </div>

      {/* User Name and Basic Info */}
      <div className="pt-20 pb-5 px-8">
        <h1 className="text-3xl font-bold">{user.name}</h1>
        <div className="mt-1 text-gray-600">
          {user.profile?.workTitle && (
            <p className="text-lg">{user.profile.workTitle}</p>
          )}
          <div className="flex gap-3 mt-1 text-sm">
            {user.community && (
              <span className="flex items-center gap-1">
                <span>Community:</span> 
                <span className="font-medium">{user.community.name}</span>
              </span>
            )}
            {user.profile?.location && (
              <span className="flex items-center gap-1">
                <span>Location:</span> 
                <span className="font-medium">{user.profile.location}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <span>Status:</span>
              <span className={`font-medium ${
                user.status === 'APPROVED' ? 'text-green-600' : 
                user.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {user.status}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 