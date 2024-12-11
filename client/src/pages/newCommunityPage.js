import React, { useState, useEffect } from "react";
import { useUser } from "../utils/userContext";

const NewCommunityPage = ({ api, setCurrentView, setSelectedCommunity, isEdit, editData }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    creator: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    description: "",
    creator: "",
    submit: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        name: editData.name.replace(/^p\//, ""), // Remove 'p/' prefix if present
        description: editData.description,
        creator: editData.creator,
      });
    }
  }, [isEdit, editData]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this community?")) {
      try {
        await api.deleteCommunity(editData._id);
        setCurrentView({ view: "profile" });
      } catch (err) {
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      submit: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Community name is required";
      isValid = false;
    } else if (formData.name.length > 100) {
      newErrors.name = "Community name must be less than 100 characters";
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    } else if (formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const existingCommunities = await api.getAllCommunities();
    const isDuplicateName = existingCommunities.some(
      (community) =>
        community.name.replace(/^p\//, '').toLowerCase() === formData.name.trim().toLowerCase()
    );

    if (isDuplicateName && !isEdit) {
      setErrors((prev) => ({
        ...prev,
        name: "A community with this name already exists. Please choose a unique name.",
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      const communityData = {
        name: "p/" + formData.name.trim(),
        description: formData.description.trim(),
        creator: String(user.displayName),
      };

      let community;
      if (isEdit) {
        community = await api.updateCommunity(editData._id, communityData);
      } else {
        community = await api.createCommunity(communityData);
      }
      const fetchedCommunity= await api.getAllCommunities();
      const selectedCommunity = fetchedCommunity.find(
        (c) => c.name === communityData.name
      );
      //Join the new community
      await api.joinCommunity(selectedCommunity._id, user.displayName);

      const updatedCommunities = await api.getAllCommunities();
      window.dispatchEvent(new CustomEvent('communityCreated', {
        detail: { communities: updatedCommunities }
      }))
      // Navigate to the newly created community
      setSelectedCommunity(community.name);
      setCurrentView("community");
    } catch (error) {
      console.error("Error creating community:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Failed to create community. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <div>Please log in to create a community</div>;
  }
  
  return (
    <div id="new-community-page">
      <h1 className="text-2xl font-bold mb-6">Create a New Community</h1>

      <form id="new-community-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">
            Community Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            maxLength={100}
            disabled={isSubmitting}
          />
          {errors.name && <div className="error">{errors.name}</div>}
          <small className="text-gray-500">
            {formData.name.length}/100 characters
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            maxLength={500}
            disabled={isSubmitting}
          />
          {errors.description && (
            <div className="error">{errors.description}</div>
          )}
          <small className="text-gray-500">
            {formData.description.length}/500 characters
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="creator">
            Creator <span className="text-red-500">*</span>
          </label>
          <input type="text" value={user.displayName} disabled />
        </div>

        {errors.submit && <div className="text-red-500">{errors.submit}</div>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating Community..." : "Engender Community"}
        </button>
        {isEdit && (
          <button type="button" onClick={handleDelete}>
            Delete
          </button>
        )}
      </form>
    </div>
  );
};

export default NewCommunityPage;
