'use client';

import { useState, useRef, FormEvent } from 'react';
import { FaTimes } from 'react-icons/fa';
import { ProfileData } from '@/types/user';

type ProfileEditModalProps = {
  profileData: ProfileData;
  onClose: () => void;
  onSave: (data: ProfileData) => void;
};

export default function ProfileEditModal({ 
  profileData, 
  onClose, 
  onSave 
}: ProfileEditModalProps) {
  // Parse interests from the profileData
  const initialInterests = profileData.interests || [];
  
  // State for form fields
  const [bio, setBio] = useState(profileData.bio || '');
  const [workTitle, setWorkTitle] = useState(profileData.workTitle || '');
  const [location, setLocation] = useState(profileData.location || '');
  const [interests, setInterests] = useState<string[]>(initialInterests);
  const [newInterest, setNewInterest] = useState('');
  
  // Reference to track clicks inside/outside modal
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    onSave({
      bio,
      workTitle,
      location,
      interests,
    });
  };
  
  // Add new interest
  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };
  
  // Remove interest
  const removeInterest = (interestToRemove: string) => {
    setInterests(interests.filter(interest => interest !== interestToRemove));
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Bio */}
          <div className="mb-4">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Tell us about yourself..."
            />
          </div>
          
          {/* Work Title */}
          <div className="mb-4">
            <label htmlFor="workTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Work Title
            </label>
            <input
              type="text"
              id="workTitle"
              value={workTitle}
              onChange={(e) => setWorkTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g. Software Engineer"
            />
          </div>
          
          {/* Location */}
          <div className="mb-4">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g. Berlin, Germany"
            />
          </div>
          
          {/* Interests */}
          <div className="mb-6">
            <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
              Interests
            </label>
            <div className="flex mb-2">
              <input
                type="text"
                id="interests"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
                placeholder="e.g. Photography"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
              />
              <button
                type="button"
                onClick={addInterest}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {interests.map((interest, index) => (
                <div 
                  key={index} 
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    aria-label={`Remove ${interest}`}
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 