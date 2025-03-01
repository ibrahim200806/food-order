import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    stock: '',
    featured: false
  });
  
  const [categories, setCategories] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch product data and categories when component mounts
  useEffect(() => {
    const fetchProductAndCategories = async () => {
      try {
        setLoading(true);
        
        // Fetch product data
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (productError) throw productError;
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
          
        if (categoriesError) throw categoriesError;
        
        // Set states
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || '',
          category: product.category_id || '',
          image_url: product.image_url || '',
          stock: product.stock || '',
          featured: product.featured || false
        });
        
        setImagePreview(product.image_url);
        setCategories(categoriesData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load product data');
        toast.error('Error loading product data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductAndCategories();
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const uploadImage = async () => {
    if (!uploadedImage) return formData.image_url;
    
    try {
      // Create a unique file name
      const fileExt = uploadedImage.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, uploadedImage);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading image');
      throw error;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Upload image if a new one was selected
      const imageUrl = uploadedImage ? await uploadImage() : formData.image_url;
      
      // Update product in the database
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category_id: formData.category,
          image_url: imageUrl,
          stock: parseInt(formData.stock),
          featured: formData.featured
        })
        .eq('id', id);
        
      if (updateError) throw updateError;
      
      toast.success('Product updated successfully');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Failed to update product');
      toast.error('Error updating product');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return (
    <AdminLayout>
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-600">Loading product data...</p>
      </div>
    </AdminLayout>
  );
  
  if (error) return (
    <AdminLayout>
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    </AdminLayout>
  );
  
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    className="input w-full"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="input w-full"
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      className="input w-full"
                      id="price"
                      name="price"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      className="input w-full"
                      id="stock"
                      name="stock"
                      min="0"
                      value={formData.stock}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    className="input w-full"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Image
                  </label>
                  <input
                    type="file"
                    className="input w-full"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <p className="text-sm text-gray-500 mt-1">Leave empty to keep the current image</p>
                </div>
                
                {imagePreview && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Image</label>
                    <div className="text-center">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="h-40 w-40 object-cover rounded-md mx-auto"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                  />
                  <label className="ml-2 block text-sm text-gray-700" htmlFor="featured">
                    Featured Product
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
                    onClick={() => navigate('/admin/products')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </AdminLayout>
      );
    };

export default EditProduct;