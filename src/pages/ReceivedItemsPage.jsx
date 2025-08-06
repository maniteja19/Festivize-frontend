// src/pages/ReceivedItemsPage.jsx
import React, { useState, useEffect } from 'react';
import { getReceivedItems, addReceivedItem, updateReceivedItem, deleteReceivedItem } from '../services/api';
import { useYear } from '../contexts/YearContext'; // NEW: Import useYear
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { PlusCircle, Edit, Trash2 } from 'lucide-react'; // Icons for actions

const ReceivedItemsPage = () => {
  const { currentYear, yearLoading, yearError, getIsCurrentYearClosed, isAdmin } = useYear(); // NEW: Use year context
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null); // For editing
  const [formData, setFormData] = useState({
    itemName: '',
    amount: '',
    denotedBy: '',
    status: 'pending',
    collectedBy: '',
    year: currentYear, // NEW: Include currentYear in formData
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const isCurrentYearClosed = getIsCurrentYearClosed();

  useEffect(() => {
    // Update formData's year whenever currentYear changes
    setFormData(prev => ({ ...prev, year: currentYear }));
    if (!yearLoading && !yearError) { // Only fetch if year context is ready
      fetchReceivedItems();
    }
  }, [currentYear, yearLoading, yearError]); // Re-fetch when currentYear changes or year context loads

  const fetchReceivedItems = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getReceivedItems(currentYear);
      console.log(data)
      setItems(data.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch received items.');
      console.error('Fetch received items error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (isCurrentYearClosed) {
      setFormError(`Cannot add/edit items. Year ${currentYear} is closed for editing.`);
      return;
    }

    // Basic validation
    if (!formData.itemName || !formData.denotedBy || !formData.status || !formData.amount) {
      setFormError('Please fill in all required fields (Item Name, Amount, Denoted By, Status).');
      return;
    }

    // Debugging: Log formData before sending
    console.log("Sending formData to backend:", formData);

    try {
      if (currentItem) {
        // Update existing item
        await updateReceivedItem(currentItem._id, formData);
        setFormSuccess('Item updated successfully!');
      } else {
        // Add new item
        await addReceivedItem(formData);
        setFormSuccess('Item added successfully!');
      }
      fetchReceivedItems(); // Refresh the list
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess('');
      }, 1500);
    } catch (err) {
      setFormError(err.message || 'Failed to save item.');
      console.error('Save item error:', err);
    }
  };

  const handleDelete = async (id, itemName) => {
    if (isCurrentYearClosed) {
      alert(`Cannot delete item. Year ${currentYear} is closed for editing.`); // Using alert for simplicity, replace with modal
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
      try {
        setError('');
        await deleteReceivedItem(id);
        fetchReceivedItems(); // Refresh the list
      } catch (err) {
        setError(err.message || 'Failed to delete item.');
        console.error('Delete item error:', err);
      }
    }
  };

  const openAddModal = () => {
    setCurrentItem(null);
    setFormData({
      itemName: '',
      amount: '',
      denotedBy: '',
      status: 'pending',
      collectedBy: '',
      year: currentYear, // Ensure new items get the current year
    });
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setCurrentItem(item);
    setFormData({
      itemName: item.itemName,
      amount: item.amount,
      denotedBy: item.denotedBy,
      status: item.status,
      collectedBy: item.collectedBy,
      year: item.year, // Keep the original year of the item
    });
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setFormError('');
    setFormSuccess('');
  };

  if (loading || yearLoading) { // Check both loading states
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (yearError) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center text-red-600">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Received Items for {currentYear}</h2>
        <p>{yearError}</p>
        <p>Please try refreshing the page or contact support.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Received Items for {currentYear}</h2>
        <button
          onClick={openAddModal}
          disabled={isCurrentYearClosed} // Disable if year is closed
          className={`flex items-center font-semibold py-2 px-4 rounded-md shadow-md transition duration-200 ${
            isCurrentYearClosed ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <PlusCircle size={20} className="mr-2" /> Add Item
        </button>
      </div>

      {isCurrentYearClosed && (
        <p className="text-orange-600 text-center mb-4 text-lg font-semibold">
          Year {currentYear} is closed. Data cannot be added, edited, or deleted.
        </p>
      )}
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      {items.length === 0 ? (
        <p className="text-gray-600 text-center text-lg">No received items found for {currentYear}. Add one to get started!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Item Name</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Denoted By</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Collected By</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800">{item.itemName}</td>
                  <td className="py-3 px-4 text-gray-800">{item.amount}</td>
                  <td className="py-3 px-4 text-gray-800">{item.denotedBy}</td>
                  <td className="py-3 px-4 text-gray-800">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'cash' || item.status === 'UPI' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-800">{item.collectedBy || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-800">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 flex space-x-2">
                    <button
                      onClick={() => openEditModal(item)}
                      disabled={isCurrentYearClosed} // Disable if year is closed
                      className={`p-1 rounded-md transition duration-200 ${
                        isCurrentYearClosed ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
                      }`}
                      title="Edit Item"
                    >
                      <Edit size={18} />
                    </button>
                    {isAdmin && ( // Only render delete button if isAdmin is true
                      <button
                        onClick={() => handleDelete(item._id, item.itemName)}
                        disabled={isCurrentYearClosed} // Disable if year is closed
                        className={`p-1 rounded-md transition duration-200 ${
                          isCurrentYearClosed ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800 hover:bg-red-100'
                        }`}
                        title="Delete Item"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem ? 'Edit Received Item' : 'Add New Received Item'}>
        <form onSubmit={handleAddEditSubmit} className="space-y-4">
          {formError && <p className="text-red-600 text-center">{formError}</p>}
          {formSuccess && <p className="text-green-600 text-center">{formSuccess}</p>}
          <div>
            <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="itemName"
              name="itemName"
              value={formData.itemName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
              min="0"
            />
          </div>
          <div>
            <label htmlFor="denotedBy" className="block text-sm font-medium text-gray-700 mb-1">
              Denoted By <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="denotedBy"
              name="denotedBy"
              value={formData.denotedBy}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="pending">Pending</option>
              <option value="UPI">UPI</option>
              <option value="cash">Cash</option>
              <option value="visit again">Visit again</option>

            </select>
          </div>
          <div>
            <label htmlFor="collectedBy" className="block text-sm font-medium text-gray-700 mb-1">
              Collected By
            </label>
            <input
              type="text"
              id="collectedBy"
              name="collectedBy"
              value={formData.collectedBy}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Hidden year field, automatically set */}
          <input type="hidden" name="year" value={formData.year} />
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={closeModal}
              className="py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-md shadow-sm transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-md transition duration-200"
            >
              {currentItem ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReceivedItemsPage;
