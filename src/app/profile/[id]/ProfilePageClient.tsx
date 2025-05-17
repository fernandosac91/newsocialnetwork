'use client';

import { useState } from 'react';
import { UserWithProfile, Friend, Circle, Event, ProfileData } from '@/types/user';
import ProfileHeader from '@/components/profile/ProfileHeader';
import AboutSection from '@/components/profile/AboutSection';
import ConnectionsSection from '@/components/profile/ConnectionsSection';
import CirclesSection from '@/components/profile/CirclesSection';
import EventsSection from '@/components/profile/EventsSection';
import ProfileEditModal from '@/components/profile/ProfileEditModal';

type ProfilePageClientProps = {
  user: UserWithProfile;
  isOwnProfile: boolean;
  connections: Friend[];
  circles: Circle[];
  events: Event[];
};

export default function ProfilePageClient({
  user,
  isOwnProfile,
  connections,
  circles,
  events,
}: ProfilePageClientProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileUpdating, setProfileUpdating] = useState(false);

  // Handle opening profile edit modal
  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  // Handle saving profile changes
  const handleSaveProfile = async (profileData: ProfileData) => {
    try {
      setProfileUpdating(true);
      
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      // Close modal and reload page to show updated info
      setShowEditModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile changes. Please try again.');
    } finally {
      setProfileUpdating(false);
    }
  };

  // Handle image uploads
  const handleUploadImage = async (type: 'profile' | 'cover') => {
    // In a real implementation, this would open a file picker and upload the image
    // For demonstration purposes, we'll use a mock implementation
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) return;
      
      try {
        const formData = new FormData();
        formData.append('type', type);
        formData.append('image', file);
        
        const response = await fetch('/api/profile/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload image');
        }
        
        // Reload page to show updated image
        window.location.reload();
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
      }
    };
    
    fileInput.click();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto pb-12">
        {/* Profile Header with cover & profile pic */}
        <ProfileHeader 
          user={user} 
          isOwnProfile={isOwnProfile}
          onEditProfile={handleEditProfile}
          onUploadImage={handleUploadImage}
        />
        
        <div className="px-4 sm:px-0 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1">
              <AboutSection 
                user={user} 
                isOwnProfile={isOwnProfile} 
                onEditProfile={handleEditProfile}
              />
              <ConnectionsSection 
                connections={connections} 
                totalCount={connections.length} 
              />
            </div>
            
            {/* Right Column */}
            <div className="lg:col-span-2">
              <CirclesSection 
                circles={circles} 
                totalCount={circles.length} 
              />
              <EventsSection 
                events={events} 
                totalCount={events.length} 
              />
            </div>
          </div>
        </div>
        
        {/* Edit Profile Modal */}
        {showEditModal && (
          <ProfileEditModal
            profileData={{
              bio: user.profile?.bio || null,
              workTitle: user.profile?.workTitle || null,
              location: user.profile?.location || null,
              interests: user.profile?.interests 
                ? JSON.parse(user.profile.interests as string) 
                : null,
            }}
            onClose={() => setShowEditModal(false)}
            onSave={handleSaveProfile}
          />
        )}
      </div>
    </div>
  );
} 