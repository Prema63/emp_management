import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../lib/lib';
import { useSelector } from 'react-redux';

const SalarySlip = () => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const { userData } = useSelector((state) => state.auth);

  // Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  // Initialize with current month
  React.useEffect(() => {
    setSelectedMonth(getCurrentMonth());
  }, []);

  const fetchSalary = async () => {
    if (!selectedMonth) {
      setError('Please select a month');
      return;
    }

    setLoading(true);
    setError('');
    setSalary(null);

    try {
      const res = await axios.post(
        `${BASE_URL}api/salary/month`,
        { month: selectedMonth },
        { withCredentials: true }
      );
      console.log(res.data)

      if (res.data.salary) {
        setSalary(res.data.salary);
      } else {
        setError('No salary record found for selected month');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch salary');
      console.error('Error fetching salary:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadSalarySlip = async () => {
    if (!salary) {
      setError('Please view salary details first before downloading');
      return;
    }

    setDownloading(true);
    setError('');

    try {
      //create HTML for PDF
      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 3px solid #4F46E5;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #4F46E5;
              margin: 0 0 10px 0;
              font-size: 32px;
            }
            .header p {
              color: #6B7280;
              margin: 5px 0;
            }
            .info-section {
              margin: 30px 0;
              background: #F9FAFB;
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #E5E7EB;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 15px 0;
              padding: 10px 0;
              border-bottom: 1px solid #E5E7EB;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: 600;
              color: #374151;
            }
            .value {
              color: #1F2937;
            }
            .salary-amount {
              background: #10B981;
              color: white;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin: 30px 0;
            }
            .salary-amount h2 {
              margin: 0 0 10px 0;
              font-size: 18px;
              font-weight: normal;
            }
            .salary-amount .amount {
              font-size: 36px;
              font-weight: bold;
              margin: 0;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #E5E7EB;
              text-align: center;
              color: #6B7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SALARY SLIP</h1>
            <p>Monthly Salary Statement</p>
          </div>
          
          <div class="info-section">
            <div class="info-row">
              <span class="label">Employee Name:</span>
              <span class="value">${userData.employee.name}</span>
            </div>
            <div class="info-row">
              <span class="label">Salary Month:</span>
              <span class="value">${formatMonthYear(selectedMonth)}</span>
            </div>
            <div class="info-row">
              <span class="label">Payment Date:</span>
              <span class="value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          <div class="salary-amount">
            <h2>Net Salary</h2>
            <p class="amount">${formatCurrency(salary.monthly_salary)}</p>
          </div>

          <div class="footer">
            <p>This is a computer-generated salary slip and does not require a signature.</p>
            <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </body>
        </html>
      `;

      // Create a new window to print salary slip
      const printWindow = window.open('', '_blank');
      printWindow.document.write(pdfContent);
      printWindow.document.close();

      // Wait for content to load then trigger print
      printWindow.onload = () => {
        printWindow.print();
        setDownloading(false);
      };

      // Fallback in case onload doesn't fire
      setTimeout(() => {
        setDownloading(false);
      }, 1000);

    } catch (err) {
      setError('Failed to generate salary slip');
      console.error('Error generating salary slip:', err);
      setDownloading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatMonthYear = (monthString) => {
    const [year, month] = monthString.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Salary Slip Manager
            </h1>
            <p className="text-gray-600">
              View and download your monthly salary slips
            </p>
          </div>

          {/* Month Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Month & Year
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              max={getCurrentMonth()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={fetchSalary}
              disabled={loading || !selectedMonth}
              className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </span>
              ) : (
                'View Salary'
              )}
            </button>

            <button
              onClick={downloadSalarySlip}
              disabled={downloading || !salary}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 shadow-md hover:shadow-lg"
            >
              {downloading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Print/Download PDF
                </span>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Salary Details */}
          {salary && (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Salary Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Employee Name</p>
                  <p className="text-lg font-semibold text-gray-800">{userData.employee.name}</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Salary Month</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {formatMonthYear(selectedMonth)}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm md:col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Salary Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(salary.monthly_salary)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!salary && !loading && !error && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">Select a month and click "View Salary" to see details</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SalarySlip;