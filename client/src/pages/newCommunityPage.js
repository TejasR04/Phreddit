import React, { useState } from "react";

const NewCommunityPage = ({ api, setCurrentView, setSelectedCommunity }) => {
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

    if (!formData.creator.trim()) {
      newErrors.creator = "Creator username is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const communityData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        members: [formData.creator.trim()],
      };

      const newCommunity = await api.createCommunity(communityData);

      const updatedCommunities = await api.getAllCommunities();
      window.dispatchEvent(new CustomEvent('communityCreated', {
        detail: { communities: updatedCommunities }
      }))
      // Navigate to the newly created community
      setSelectedCommunity(newCommunity.name);
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
            Creator Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="creator"
            name="creator"
            value={formData.creator}
            onChange={handleInputChange}
            disabled={isSubmitting}
          />
          {errors.creator && (
            <div className="error">{errors.creator}</div>
          )}
        </div>

        {errors.submit && (
          <div className="text-red-500">{errors.submit}</div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Community..." : "Engender Community"}
        </button>
      </form>
    </div>
  );
};

export default NewCommunityPage;
