import React from 'react'
import MainProfileHeader from '@/modules/profile/components/main-profile-header';
import { ProfileData } from '@/modules/profile/actions';
import ProfileUserData from '@/modules/profile/components/profile-user-data';

const ProfilePage = async() => {
  const profiledata = await ProfileData();

  return (
    <>
    <div className='flex flex-col'>
    <MainProfileHeader userProfileData={profiledata}/>
    <ProfileUserData/>
    </div>
    
    </>
  )
}

export default ProfilePage;