import { UserWithProfile } from '@/types/user';
import { FaPencilAlt } from 'react-icons/fa';

type AboutSectionProps = {
  user: UserWithProfile;
  isOwnProfile: boolean;
  onEditProfile: () => void;
};

export default function AboutSection({ user, isOwnProfile, onEditProfile }: AboutSectionProps) {
  // Parse interests from JSON string
  const interests = user.profile?.interests 
    ? JSON.parse(user.profile.interests as string) 
    : [];
  
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">About</h2>
        {isOwnProfile && (
          <button 
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            aria-label="Edit about section"
            onClick={onEditProfile}
          >
            <FaPencilAlt size={14} />
            <span>Edit</span>
          </button>
        )}
      </div>

      {/* Bio */}
      <div className="mb-6">
        {user.profile?.bio ? (
          <p className="text-gray-600 whitespace-pre-line">{user.profile.bio}</p>
        ) : (
          <p className="text-gray-400 italic">
            {isOwnProfile 
              ? "Add your bio to tell people more about yourself"
              : "This user hasn't added a bio yet"}
          </p>
        )}
      </div>

      {/* Interests */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Interests</h3>
        {interests.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {interests.map((interest: string, index: number) => (
              <span 
                key={index} 
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 italic">
            {isOwnProfile 
              ? "Add your interests to connect with like-minded people"
              : "This user hasn't added any interests yet"}
          </p>
        )}
      </div>
    </div>
  );
} 