import React, { createContext, useState, useEffect, useContext } from 'react';
import { getYears as apiGetYears, createYear as apiCreateYear, updateYearStatus as apiUpdateYearStatus } from '../services/api';
import { useAuth } from './AuthContext'; // To get user role for admin checks

const YearContext = createContext(null);

export const YearProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // Default to current year
  const [availableYears, setAvailableYears] = useState([]);
  const [yearLoading, setYearLoading] = useState(true);
  const [yearError, setYearError] = useState('');

  // Fetch available years on component mount or when auth state changes
  useEffect(() => {
    const fetchYears = async () => {
      if (!isAuthenticated || authLoading) {
        setYearLoading(false);
        return;
      }
      try {
        setYearLoading(true);
        setYearError('');
        const data = await apiGetYears();
        const years = data.data.map(y => ({ year: y.year, isClosed: y.isClosed }));
        setAvailableYears(years);

        // If no years exist, or current year isn't in list, create it or set default
        if (years.length === 0) {
          // Optionally, auto-create current year if no years exist
          // await createYear(new Date().getFullYear()); // This would auto-create on first load
          setCurrentYear(new Date().getFullYear()); // Ensure current year is set
        } else {
          // If current year is not among available years, set it to the latest available year
          const latestYear = Math.max(...years.map(y => y.year));
          if (!years.some(y => y.year === currentYear)) {
            setCurrentYear(latestYear);
          }
        }

      } catch (err) {
        setYearError(err.message || 'Failed to fetch available years.');
        console.error('Fetch years error:', err);
      } finally {
        setYearLoading(false);
      }
    };

    fetchYears();
  }, [isAuthenticated, authLoading]); // Re-fetch when authentication status changes

  const createYear = async (year) => {
    try {
      setYearLoading(true);
      setYearError('');
      const response = await apiCreateYear({ year });
      // Add the new year to availableYears and set it as current if successful
      setAvailableYears(prev => [...prev, { year: response.data.year, isClosed: response.data.isClosed }].sort((a,b) => b.year - a.year));
      setCurrentYear(response.data.year); // Automatically switch to the newly created year
      return { success: true, message: response.message };
    } catch (err) {
      setYearError(err.message || 'Failed to create year.');
      console.error('Create year error:', err);
      return { success: false, message: err.message || 'Failed to create year.' };
    } finally {
      setYearLoading(false);
    }
  };

  const updateYearStatus = async (year, isClosed) => {
    try {
      setYearLoading(true);
      setYearError('');
      const response = await apiUpdateYearStatus(year, { isClosed });
      setAvailableYears(prev => prev.map(y =>
        y.year === year ? { ...y, isClosed: response.data.isClosed } : y
      ));
      return { success: true, message: response.message };
    } catch (err) {
      setYearError(err.message || 'Failed to update year status.');
      console.error('Update year status error:', err);
      return { success: false, message: err.message || 'Failed to update year status.' };
    } finally {
      setYearLoading(false);
    }
  };

  const getIsCurrentYearClosed = () => {
    const yearData = availableYears.find(y => y.year === currentYear);
    return yearData ? yearData.isClosed : false;
  };

  const value = {
    currentYear,
    setCurrentYear,
    availableYears,
    yearLoading,
    yearError,
    createYear,
    updateYearStatus,
    getIsCurrentYearClosed,
    isAdmin: user?.role === 'admin' // Pass admin status for UI control
  };

  return <YearContext.Provider value={value}>{children}</YearContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useYear = () => {
  return useContext(YearContext);
};
