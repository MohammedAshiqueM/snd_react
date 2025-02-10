import React, { useState } from 'react';
import axios from 'axios';
import { X, Upload } from 'lucide-react';
import { tagSuggestion, updateProfile } from '../api';
import { isValidURL, validateImage } from '../util';
import { getCloudinaryUrl } from '../constants/constant';

export default function EditProfileModal({ isOpen, onClose, userData }) {
    const [formData, setFormData] = useState({
      first_name: userData?.first_name || '',
      last_name: userData?.last_name || '',
    //   username: userData?.username || '',
    //   email: userData?.email || '',
      github_url: userData?.github_url || '',
      linkedin_url: userData?.linkedin_url || '',
      about: userData?.about || '',
      skills: userData?.skills?.map(skill => skill.tag?.name || skill) || [],
      profile_image: null,
      banner_image: null,
    });
  
    const [profileImagePreview, setProfileImagePreview] = useState(
    userData?.profile_image ? getCloudinaryUrl(userData.profile_image) : null
    );
    
    const [bannerImagePreview, setBannerImagePreview] = useState(
    userData?.banner_image ? getCloudinaryUrl(userData.banner_image) : null
    );
    const [tagSuggestions, setTagSuggestions] = useState([]);
    const [selectedTags, setSelectedTags] = useState(userData?.skills?.map(skill => skill.tag?.name || skill) || []);

    const fetchTagSuggestions = async (query) => {
        if (query) {
          try {
            const response = await tagSuggestion(query);
            setTagSuggestions(response.data.tags); 
          } catch (error) {
            console.error('Error fetching tags:', error);
          }
        } else {
          setTagSuggestions([]);
        }
      };

      const handleTagSelect = (tag) => {
        if (!selectedTags.includes(tag)) {
          setSelectedTags([...selectedTags, tag]);
          setFormData((prev) => ({
            ...prev,
            skills: [...prev.skills, tag],
          }));
        }
        setTagSuggestions([]);
      };
      
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    };
  
    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        console.log('File selected:', file); 
        
        if (file) {
          setFormData(prev => ({
            ...prev,
            [type]: file,
          }));
      
          const reader = new FileReader();
          reader.onloadend = () => {
            if (type === 'profile_image') {
              setProfileImagePreview(reader.result);
            } else {
              setBannerImagePreview(reader.result);
            }
          };
          reader.readAsDataURL(file);
        }
      };
      
  
    const handleSkillChange = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
          const newSkill = e.target.value.trim();
          if (newSkill && !selectedTags.includes(newSkill)) {
            setSelectedTags((prevTags) => [...prevTags, newSkill]);
            setFormData((prevData) => ({
              ...prevData,
              skills: [...prevData.skills, newSkill],
            }));
          }
          e.target.value = '';
        } else {
          fetchTagSuggestions(e.target.value);
        }
      };
  
      const removeSkill = (skillToRemove) => {
        setSelectedTags((prevTags) => {
          const updatedTags = prevTags.filter((tag) => tag !== skillToRemove);
          setFormData((prev) => ({
            ...prev,
            skills: updatedTags,
          }));
          return updatedTags;
        });
    };
  
    const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate LinkedIn and GitHub URLs
  const linkedinError = isValidURL(formData.linkedin_url, "linkedin");
  const githubError = isValidURL(formData.github_url, "github");

  if (linkedinError) {
      alert(linkedinError);
      return;
  }

  if (githubError) {
      alert(githubError);
      return;
  }

    // Validate image
    const profileImageError = validateImage(formData.profile_image);
    const bannerImageError = validateImage(formData.banner_image);
    console.log("1111111111111111111111111111111222222222222222",bannerImageError)

    if (profileImageError) {
        alert(profileImageError);
        return;
    }
  
    if (bannerImageError) {
        alert(bannerImageError);
        return;
    }

  const submitData = new FormData();

  Object.keys(formData).forEach(key => {
      if (key !== 'profile_image' && key !== 'banner_image' && key !== 'skills') {
      submitData.append(key, formData[key]);
    }
  });
  
  if (formData.profile_image) {
      console.log('Appending profile image:', formData.profile_image); 
    submitData.append('profile_image', formData.profile_image); 
  }
  
  if (formData.banner_image) {
    console.log('Appending banner image:', formData.banner_image); 
    submitData.append('banner_image', formData.banner_image); 
}

  for (let pair of submitData.entries()) {
    console.log(pair[0] + ': ' + pair[1]);
  }

  console.log("Skills being submitted:", formData.skills);
  if (formData.skills && formData.skills.length > 0) {
    formData.skills.forEach((skill, index) => {
      submitData.append('skills', skill);
    });
  }
  console.log("........",submitData.formData)
  
  try {
    const response = await updateProfile(submitData); 
    // console.log('Profile updated successfully:', response.data); 
    onClose();
  } catch (error) {
    console.error('Profile update failed:', error);
  }
};

  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
        <div className="bg-[#0D0E21] w-full sm:w-[800px] p-6 rounded-lg relative max-h-[90vh] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
          <h2 className="text-xl font-bold text-white mb-6">Edit Profile</h2>
  
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image Upload */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2">Profile Image</label>
                <div className="relative w-full h-48 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                  {profileImagePreview ? (
                    <img src={profileImagePreview} alt="Profile Preview" className="max-h-full max-w-full object-cover rounded-lg" />
                  ) : (
                    <div className="text-center text-gray-400">No image selected</div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'profile_image')}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white mb-2">Banner Image</label>
                <div className="relative w-full h-48 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                  {bannerImagePreview ? (
                    <img src={bannerImagePreview} alt="Banner Preview" className="max-h-full max-w-full object-cover rounded-lg" />
                  ) : (
                    <div className="text-center text-gray-400">No image selected</div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'banner_image')}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
  
            {/* Text Fields */}
            {['first_name', 'last_name', 'github_url', 'linkedin_url', 'about'].map(field => (
              <div key={field}>
                <label className="block text-white mb-1 capitalize">{field.replace('_', ' ')}</label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full p-2 rounded-md bg-[#1C1D2D] text-white"
                />
              </div>
            ))}
  
            {/* Skills */}
            <div>
      <label className="block text-white mb-1">Skills</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map((skill, index) => (
          <span key={index} className="bg-gray-700 text-white px-2 py-1 rounded-full flex items-center">
            {skill}
            <button type="button" onClick={() => removeSkill(skill)} className="ml-2 text-red-300 hover:text-red-500">
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        placeholder="Add skill (press Enter or , to add)"
        onKeyDown={handleSkillChange}
        className="w-full p-2 rounded-md bg-[#1C1D2D] text-white"
      />
      {tagSuggestions.length > 0 && (
            <ul className="mt-2 bg-[#1C1D2D] p-2 rounded-md">
            {tagSuggestions.map((tag) => (
                <li
                key={tag.id}
                onClick={() => handleTagSelect(tag.name)}
                className="text-white cursor-pointer hover:bg-gray-600 p-1 rounded-md"
                >
                {tag.name}
                </li>
            ))}
            </ul>
        )}
        </div>
  
            {/* Submit */}
            <div className="flex justify-end gap-4">
              <button type="button" onClick={onClose} className="border border-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                Cancel
              </button>
              <button type="submit" className="bg-[#4D7EF2] text-white px-4 py-2 rounded-md hover:bg-blue-600">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  