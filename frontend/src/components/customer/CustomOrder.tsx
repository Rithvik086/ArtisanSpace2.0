import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ChangeEvent, FormEvent } from 'react';
import '../assets/customer/customOrder.css';

interface FormData {
  title: string;
  type: string;
  description: string;
  budget: string;
  requiredBy: string;
  image?: File;
}

interface ValidationErrors {
  title: boolean;
  description: boolean;
  budget: boolean;
}

const CustomOrder: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    type: '',
    description: '',
    budget: '',
    requiredBy: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({
    title: false,
    description: false,
    budget: false,
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const titleRegex = /^[a-zA-Z0-9 ]+$/;
  const descriptionRegex = /^[a-zA-Z0-9\s.,'"\-!?()]+$/;
  const budgetRegex = /^(?!0+$)([1-9]\d{0,5})$/;

  const validateField = (name: keyof ValidationErrors, value: string): boolean => {
    switch (name) {
      case 'title':
        return titleRegex.test(value);
      case 'description':
        const wordCount = value.trim().split(/\s+/).length;
        return value.trim() !== '' && wordCount >= 10 && wordCount <= 300 && descriptionRegex.test(value);
      case 'budget':
        return budgetRegex.test(value);
      default:
        return true;
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name in errors) {
      setErrors(prev => ({
        ...prev,
        [name]: !validateField(name as keyof ValidationErrors, value)
      }));
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview('');
      setFormData(prev => {
        const newData = { ...prev };
        delete newData.image;
        return newData;
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const newErrors = {
      title: !validateField('title', formData.title),
      description: !validateField('description', formData.description),
      budget: !validateField('budget', formData.budget)
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined) {
          submitData.append(key, value);
        }
      });

      const response = await fetch('/customer/customorder', {
        method: 'POST',
        body: submitData
      });

      const result = await response.json();

      setStatusMessage({
        text: result.message,
        type: result.success ? 'success' : 'error'
      });

      if (result.success) {
        setTimeout(() => {
          navigate('/customer');
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting custom order:', error);
      setStatusMessage({
        text: 'An error occurred. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="custom-order-body">
      <main>
        <div className="form-container">
          <div className="form-header">
            <h1>Request a Custom Handcrafted Item</h1>
            <p>Describe your dream creation and our skilled artisans will bring it to life</p>
          </div>

          <div className="note-box">
            <p>Your request will be visible to all artisans on our platform. Interested artisans will contact you with proposals.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title" className="form-label required">Request Title</label>
              <input
                type="text"
                id="title"
                name="title"
                className={`form-input ${errors.title ? 'error-input' : ''}`}
                placeholder="Give your request a name"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
              {errors.title && (
                <p className="error-message">Title is only alphanumeric</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="type" className="form-label required">Type of Product</label>
              <select
                id="type"
                name="type"
                className="form-select"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Select product type</option>
                <option value="statue">Statue</option>
                <option value="painting">Painting</option>
                <option value="footware">Footware</option>
                <option value="pottery">Pottery</option>
                <option value="toys">Toys</option>
                <option value="headware">Headware</option>
                <option value="musical instrument">Musical instrument</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label required">Detailed Description</label>
              <textarea
                id="description"
                name="description"
                className={`form-textarea ${errors.description ? 'error-input' : ''}`}
                placeholder="Please describe your custom item in detail. Include size, color preferences, materials, design elements, intended use, etc."
                value={formData.description}
                onChange={handleInputChange}
                required
              />
              {errors.description && (
                <p className="error-message">Description must be 10-300 words and contain only letters, numbers, spaces, and basic punctuation</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="image" className="form-label">Reference Image</label>
              <div className="file-upload">
                <p>Drag & drop an image here or click to upload</p>
                <p>(Max 5MB)</p>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="budget" className="form-label required">Budget</label>
                <input
                  type="text"
                  id="budget"
                  name="budget"
                  className={`form-input ${errors.budget ? 'error-input' : ''}`}
                  value={formData.budget}
                  onChange={handleInputChange}
                  required
                />
                {errors.budget && (
                  <p className="error-message">Invalid budget (1-100,000)</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="requiredBy" className="form-label required">Required By</label>
                <input
                  type="date"
                  id="requiredBy"
                  name="requiredBy"
                  className="form-input"
                  value={formData.requiredBy}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading"></span>
                  Submitting...
                </>
              ) : (
                'Submit Custom Order Request'
              )}
            </button>

            {statusMessage && (
              <div className={`status-message ${statusMessage.type}`}>
                {statusMessage.text}
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default CustomOrder;