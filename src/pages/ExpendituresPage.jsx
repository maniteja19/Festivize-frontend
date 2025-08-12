// src/pages/ExpendituresPage.jsx
import React, { useState, useEffect } from 'react';
import { getExpenditures, addExpenditure, updateExpenditure, deleteExpenditure } from '../services/api';
import { useYear } from '../contexts/YearContext'; // NEW: Import useYear
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { PlusCircle, Edit, Trash2 } from 'lucide-react'; // Icons for actions

const ExpendituresPage = () => {
  const { currentYear, yearLoading, yearError, getIsCurrentYearClosed, isAdmin } = useYear(); // NEW: Use year context
  const [expenditures, setExpenditures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpenditure, setCurrentExpenditure] = useState(null); // For editing
  const [formData, setFormData] = useState({
    itemName: '',
    expenditureType: '', // Corresponds to category
    amountSpent: '', // Corresponds to cost
    paidBy: '',
    remarks: '',
    year: currentYear, // NEW: Include currentYear in formData
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const isCurrentYearClosed = getIsCurrentYearClosed();

  // Define expense categories as per requirements
  const expenseCategories = [
    'Decoration', 'Lighting & Sound', 'Pooja items','Stage','Panthulu', 'Food', 'Other'
  ];

  useEffect(() => {
    // Update formData's year whenever currentYear changes
    setFormData(prev => ({ ...prev, year: currentYear }));
    if (!yearLoading && !yearError) { // Only fetch if year context is ready
      fetchExpenditures();
    }
  }, [currentYear, yearLoading, yearError]); // Re-fetch when currentYear changes or year context loads

  const fetchExpenditures = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getExpenditures(currentYear); // Pass currentYear to API
      setExpenditures(data.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch expenditures.');
      console.error('Fetch expenditures error:', err);
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
      setFormError(`Cannot add/edit expenditures. Year ${currentYear} is closed for editing.`);
      return;
    }

    // Basic validation
    if (!formData.itemName || !formData.expenditureType || !formData.amountSpent || !formData.paidBy) {
      setFormError('Please fill in all required fields (Item Name, Category, Amount Spent, Paid By).');
      return;
    }

    try {
      if (currentExpenditure) {
        // Update existing expenditure
        await updateExpenditure(currentExpenditure._id, formData);
        setFormSuccess('Expenditure updated successfully!');
      } else {
        // Add new expenditure
        await addExpenditure(formData);
        setFormSuccess('Expenditure added successfully!');
      }
      fetchExpenditures(); // Refresh the list
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess('');
      }, 1500);
    } catch (err) {
      setFormError(err.message || 'Failed to save expenditure.');
      console.error('Save expenditure error:', err);
    }
  };

  const handleDelete = async (id, itemName) => {
    if (isCurrentYearClosed) {
      alert(`Cannot delete expenditure. Year ${currentYear} is closed for editing.`); // Using alert for simplicity, replace with modal
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
      try {
        setError('');
        await deleteExpenditure(id);
        fetchExpenditures(); // Refresh the list
      } catch (err) {
        setError(err.message || 'Failed to delete expenditure.');
        console.error('Delete expenditure error:', err);
      }
    }
  };

  const openAddModal = () => {
    setCurrentExpenditure(null);
    setFormData({
      itemName: '',
      expenditureType: '',
      amountSpent: '',
      paidBy: '',
      remarks: '',
      year: currentYear, // Ensure new expenditures get the current year
    });
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const openEditModal = (exp) => {
    setCurrentExpenditure(exp);
    setFormData({
      itemName: exp.itemName,
      expenditureType: exp.expenditureType,
      amountSpent: exp.amountSpent,
      paidBy: exp.paidBy,
      remarks: exp.remarks || '',
      year: exp.year, // Keep the original year of the expenditure
    });
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentExpenditure(null);
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
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Expenditures for {currentYear}</h2>
        <p>{yearError}</p>
        <p>Please try refreshing the page or contact support.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Expenditures for {currentYear}</h2>
        <button
          onClick={openAddModal}
          disabled={isCurrentYearClosed} // Disable if year is closed
          className={`flex items-center font-semibold py-2 px-4 rounded-md shadow-md transition duration-200 ${
            isCurrentYearClosed ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <PlusCircle size={20} className="mr-2" /> Add Expenditure
        </button>
      </div>

      {isCurrentYearClosed && (
        <p className="text-orange-600 text-center mb-4 text-lg font-semibold">
          Year {currentYear} is closed. Data cannot be added, edited, or deleted.
        </p>
      )}
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      {expenditures.length === 0 ? (
        <p className="text-gray-600 text-center text-lg">No expenditures found for {currentYear}. Add one to get started!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Item Name</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Amount Spent</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Paid By</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Remarks</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenditures.map((exp) => (
                <tr key={exp._id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800">{exp.itemName}</td>
                  <td className="py-3 px-4 text-gray-800">{exp.expenditureType}</td>
                  <td className="py-3 px-4 text-gray-800">₹{exp.amountSpent.toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-800">{exp.paidBy}</td>
                  <td className="py-3 px-4 text-gray-800">{exp.remarks || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-800">{new Date(exp.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 flex space-x-2">
                    <button
                      onClick={() => openEditModal(exp)}
                      disabled={isCurrentYearClosed}
                      className={`p-1 rounded-md transition duration-200 ${
                        isCurrentYearClosed ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
                      }`}
                      title="Edit Expenditure"
                    >
                      <Edit size={18} />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(exp._id, exp.itemName)}
                        disabled={isCurrentYearClosed} // Disable if year is closed
                        className={`p-1 rounded-md transition duration-200 ${
                          isCurrentYearClosed ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800 hover:bg-red-100'
                        }`}
                        title="Delete Expenditure"
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentExpenditure ? 'Edit Expenditure' : 'Add New Expenditure'}>
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
            <label htmlFor="expenditureType" className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="expenditureType"
              name="expenditureType"
              value={formData.expenditureType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a category</option>
              {expenseCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="amountSpent" className="block text-sm font-medium text-gray-700 mb-1">
              Amount Spent <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="amountSpent"
              name="amountSpent"
              value={formData.amountSpent}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700 mb-1">
              Paid By <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="paidBy"
              name="paidBy"
              value={formData.paidBy}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
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
              {currentExpenditure ? 'Update Expenditure' : 'Add Expenditure'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExpendituresPage;
