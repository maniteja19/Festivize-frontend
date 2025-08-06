// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { getHomeMessage, getReceivedItems, getExpenditures } from '../services/api';
import { useYear } from '../contexts/YearContext'; // NEW: Import useYear
import LoadingSpinner from '../components/LoadingSpinner';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const HomePage = () => {
  const { currentYear, yearLoading, yearError } = useYear(); // NEW: Use year context
  const [message, setMessage] = useState('');
  const [receivedItems, setReceivedItems] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (yearLoading || yearError) { // Wait for year context to load
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');

        // Fetch home message
        const homeData = await getHomeMessage();
        setMessage(homeData.message);

        // Fetch received items for the current year
        const receivedData = await getReceivedItems(currentYear);
        setReceivedItems(receivedData.data);

        // Fetch expenditures for the current year
        const expenditureData = await getExpenditures(currentYear);
        setExpenditures(expenditureData.data);

      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard data.');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentYear, yearLoading, yearError]); // Re-fetch when currentYear changes or year context loads

  // Calculate Totals
  const totalReceivedAmount = receivedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalExpenditureAmount = expenditures.reduce((sum, exp) => sum + (exp.amountSpent || 0), 0);
  const netBalance = totalReceivedAmount - totalExpenditureAmount;

  // Prepare data for Expenditure Pie Chart (by category)
  const expenditureByCategory = expenditures.reduce((acc, exp) => {
    const category = exp.expenditureType || 'Uncategorized';
    acc[category] = (acc[category] || 0) + (exp.amountSpent || 0);
    return acc;
  }, {});

  const expenditureChartData = Object.keys(expenditureByCategory).map((category) => ({
    name: category,
    value: expenditureByCategory[category],
  }));

  // Prepare data for Received Items Pie Chart (by status/condition)
  const receivedItemsByStatus = receivedItems.reduce((acc, item) => {
    const status = item.status || 'Unknown Status';
    acc[status] = (acc[status] || 0) + (item.amount || 0); // Assuming 'amount' is the quantity/value
    return acc;
  }, {});

  const receivedItemsChartData = Object.keys(receivedItemsByStatus).map((status) => ({
    name: status,
    value: receivedItemsByStatus[status],
  }));


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
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Dashboard Overview</h2>
        <p>{yearError}</p>
        <p>Please try refreshing the page or contact support.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Dashboard Overview for {currentYear}</h2>

      {error ? (
        <p className="text-red-600 text-lg text-center mb-4">{error}</p>
      ) : (
        <>
          <p className="text-gray-700 text-lg mb-6">{message}</p>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-100 p-4 rounded-lg shadow-sm border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-800 mb-2">Total Received</h3>
              <p className="text-2xl font-bold text-blue-900">₹{totalReceivedAmount.toFixed(2)}</p>
            </div>
            <div className="bg-red-100 p-4 rounded-lg shadow-sm border border-red-200">
              <h3 className="text-xl font-semibold text-red-800 mb-2">Total Expenditure</h3>
              <p className="text-2xl font-bold text-red-900">₹{totalExpenditureAmount.toFixed(2)}</p>
            </div>
            <div className={`p-4 rounded-lg shadow-sm border ${netBalance >= 0 ? 'bg-green-100 border-green-200' : 'bg-orange-100 border-orange-200'}`}>
              <h3 className={`text-xl font-semibold mb-2 ${netBalance >= 0 ? 'text-green-800' : 'text-orange-800'}`}>Net Balance</h3>
              <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-900' : 'text-orange-900'}`}>₹{netBalance.toFixed(2)}</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Expenditure Pie Chart */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Expenditure by Category</h3>
              {expenditureChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenditureChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {expenditureChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-600 text-center mt-8">No expenditure data available for charting for {currentYear}.</p>
              )}
            </div>

            {/* Received Items Pie Chart */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Received Items by Status</h3>
              {receivedItemsChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={receivedItemsChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#82ca9d"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {receivedItemsChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-600 text-center mt-8">No received items data available for charting for {currentYear}.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
