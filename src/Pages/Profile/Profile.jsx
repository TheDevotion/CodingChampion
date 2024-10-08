import React, { useState, useEffect } from 'react'
import { useUser } from '../../store/UserContext'
import { auth } from '../../config/firebase'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../Components/SideBar/SideBar'
import { FaRegEdit } from 'react-icons/fa'
import { ImCross } from 'react-icons/im'

function Profile() {
  const { userDetails, loading, isLoggedIn, updateProfilePic } = useUser()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPic, setSelectedPic] = useState(userDetails?.profilePic || '')

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
    }
  }, [isLoggedIn, navigate])

  useEffect(() => {
    if (userDetails) {
      setSelectedPic(userDetails.profilePic)
    }
  }, [userDetails])

  if (loading) {
    return <p>Loading...</p>
  }

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      navigate('/login')
    } catch (error) {
      toast.error('Error signing out.', {
        position: 'bottom-right',
        autoClose: 3000,
      })
      console.error('Error signing out:', error)
    }
  }

  const handlePicSelect = async (picName) => {
    await updateProfilePic(picName)
    setSelectedPic(picName)
    setModalOpen(false)
  }

  return (
    <div className="md:ml-52 md:mt-16 lg:ml-60 md:flex dark:text-white text-black h-screen">
      {/* Sidebar should have a fixed width */}
      {/* <Sidebar className="w-1/4 md:w-1/5"></Sidebar> */}

      {/* Main content adjusts to the remaining space */}
      <div className="p-4 w-full md:w-4/5">
        {userDetails ? (
          <>
            <p>User Name: {userDetails.userName || 'No username set'}</p>
            <p>Email: {userDetails.email}</p>

            {/* Container for Profile Pic and Edit Icon */}
            <div className="relative w-40 h-40 my-5">
              <FaRegEdit
                className="absolute top-1 right-1 text-xl text-black dark:text-white cursor-pointer hover:text-accent"
                onClick={() => setModalOpen(true)}
              />
              <img
                src={`${selectedPic}?t=${new Date().getTime()}`}
                alt="Profile"
                className="w-full h-full cursor-pointer rounded-full"
                onClick={() => setModalOpen(true)}
              />
            </div>

            <button
              onClick={handleSignOut}
              className="mt-4 bg-accent text-white px-4 py-2 rounded mx-8"
            >
              Sign Out
            </button>

            {modalOpen && (
              <div className="fixed inset-0 text-black bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md relative">
                  <span
                    className="absolute top-4 right-4 text-xl"
                    onClick={() => setModalOpen(false)}
                  >
                    <ImCross className="text-sm md:text-md text-black cursor-pointer" />
                  </span>
                  <h2 className="text-lg font-semibold mb-4">
                    Select Profile Picture
                  </h2>
                  <div className="flex flex-wrap gap-3 md:gap-4">
                    {[
                      'https://res.cloudinary.com/yashjunagade/image/upload/v1725552109/1_e5x60h.jpg',
                      'https://res.cloudinary.com/yashjunagade/image/upload/v1725552109/2_waioan.jpg',
                      'https://res.cloudinary.com/yashjunagade/image/upload/v1725552109/3_xzky8n.jpg',
                      'https://res.cloudinary.com/yashjunagade/image/upload/v1725552109/4_nvmpvq.jpg',
                      'https://res.cloudinary.com/yashjunagade/image/upload/v1725552109/5_geek0f.jpg',
                      'https://res.cloudinary.com/yashjunagade/image/upload/v1725552109/6_k3o1wj.jpg',
                      'https://res.cloudinary.com/yashjunagade/image/upload/v1725552110/7_uharyc.jpg',
                      'https://res.cloudinary.com/yashjunagade/image/upload/v1725552110/8_twqbsh.jpg',
                      'https://res.cloudinary.com/yashjunagade/image/upload/v1725552110/9_yuwpyy.jpg',
                      'https://res.cloudinary.com/yashjunagade/image/upload/v1725552110/10_j892oj.jpg',
                      'https://res.cloudinary.com/yashjunagade/image/upload/v1725552110/11_trvpva.jpg',
                    ].map((picName) => (
                      <img
                        key={picName}
                        src={`${picName}`}
                        alt={picName}
                        onClick={() => handlePicSelect(picName)}
                        className="w-20 h-20 md:w-28 md:h-28 cursor-pointer border-2 border-gray-300 rounded-[50%] hover:border-blue-500"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <p>No user details available.</p>
        )}
      </div>
    </div>
  )
}

export default Profile
