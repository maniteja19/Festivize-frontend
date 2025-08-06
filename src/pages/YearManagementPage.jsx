
import React, { useState } from 'react';
import { useYear } from '../contexts/YearContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { PlusCircle } from 'lucide-react';

const YearManagementPage = () => {
  const { availableYears, yearLoading, yearError, createYear, updateYearStatus, isAdmin } = useYear();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newYearInput, setNewYearInput] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Redirect if not admin (though Navbar should prevent access)
  if (!isAdmin) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center text-red-600">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Access Denied</h2>
        <p>You do not have administrative privileges to manage years.</p>
      </div>
    );
  }

  const handleCreateYear = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const yearNum = parseInt(newYearInput);
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      setFormError('Please enter a valid year (e.g., 2024).');
      return;
    }

    const result = await createYear(yearNum);
    if (result.success) {
      setFormSuccess(result.message);
      setNewYearInput('');
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess('');
      }, 1500);
    } else {
      setFormError(result.message);
    }
  };

  const handleToggleStatus = async (year, currentStatus) => {
    const newStatus = !currentStatus;
    if (window.confirm(`Are you sure you want to ${newStatus ? 'CLOSE' : 'OPEN'} year ${year}?`)) {
      const result = await updateYearStatus(year, newStatus);
      if (!result.success) {
        alert(result.message); // Use alert for simplicity, replace with modal
      }
    }
  };

  if (yearLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (yearError) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center text-red-600">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Year Management</h2>
        <p>{yearError}</p>
        <p>Please try refreshing the page or contact support.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Festival Years</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200"
        >
          <PlusCircle size={20} className="mr-2" /> Create New Year
        </button>
      </div>

      {availableYears.length === 0 ? (
        <p className="text-gray-600 text-center text-lg">No festival years found. Create the first one!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Year</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {availableYears.map((yearObj) => (
                <tr key={yearObj.year} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800">{yearObj.year}</td>
                  <td className="py-3 px-4 text-gray-800">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      yearObj.isClosed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {yearObj.isClosed ? 'Closed' : 'Open'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleStatus(yearObj.year, yearObj.isClosed)}
                      className={`py-1 px-3 rounded-md text-sm font-semibold transition duration-200 ${
                        yearObj.isClosed
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}
                    >
                      {yearObj.isClosed ? 'Open Year' : 'Close Year'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Festival Year">
        <form onSubmit={handleCreateYear} className="space-y-4">
          {formError && <p className="text-red-600 text-center">{formError}</p>}
          {formSuccess && <p className="text-green-600 text-center">{formSuccess}</p>}
          <div>
            <label htmlFor="newYearInput" className="block text-sm font-medium text-gray-700 mb-1">
              Year (e.g., 2025) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="newYearInput"
              name="newYearInput"
              value={newYearInput}
              onChange={(e) => setNewYearInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
              min="2000"
              max="2100"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-md shadow-sm transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-md transition duration-200"
            >
              Create Year
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default YearManagementPage;
