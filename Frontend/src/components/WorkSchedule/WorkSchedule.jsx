import React, { useState, useEffect } from 'react';
import api from '@/utils/axios';
import './WorkSchedule.css';

const WorkSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    startTime: '',
    endTime: '',
    position: '',
    status: 'scheduled'
  });

  useEffect(() => {
    fetchEmployees();
    fetchSchedules();
  }, [selectedDate]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (err) {
      setError('Failed to fetch employees');
      console.error('Error fetching employees:', err);
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/schedules`, {
        params: { date: selectedDate }
      });
      setSchedules(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch schedules');
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/schedules', formData);
      setSuccess('Schedule added successfully');
      setFormData({
        employeeId: '',
        date: '',
        startTime: '',
        endTime: '',
        position: '',
        status: 'scheduled'
      });
      fetchSchedules();
    } catch (err) {
      setError('Failed to add schedule');
      console.error('Error adding schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (scheduleId, newStatus) => {
    try {
      setLoading(true);
      await api.patch(`/schedules/${scheduleId}`, {
        status: newStatus
      });
      setSuccess('Schedule status updated successfully');
      fetchSchedules();
    } catch (err) {
      setError('Failed to update schedule status');
      console.error('Error updating schedule status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        setLoading(true);
        await api.delete(`/schedules/${scheduleId}`);
        setSuccess('Schedule deleted successfully');
        fetchSchedules();
      } catch (err) {
        setError('Failed to delete schedule');
        console.error('Error deleting schedule:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp._id === employeeId);
    return employee ? employee.fullName : 'Unknown';
  };

  return (
    <div className="work-schedule">
      <h2>Work Schedule Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="schedule-form">
        <h3>Add New Schedule</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="employeeId">Employee</label>
              <select
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Employee</option>
                {employees.map(employee => (
                  <option key={employee._id} value={employee._id}>
                    {employee.fullName} - {employee.position}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="endTime">End Time</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="position">Position</label>
            <select
              id="position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Position</option>
              <option value="manager">Manager</option>
              <option value="chef">Chef</option>
              <option value="server">Server</option>
              <option value="bartender">Bartender</option>
              <option value="kitchen">Kitchen Staff</option>
              <option value="cleaner">Cleaner</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              Add Schedule
            </button>
          </div>
        </form>
      </div>

      <div className="schedule-filters">
        <input
          type="date"
          className="date-filter"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Loading schedules...</div>
      ) : (
        <div className="schedule-list">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Position</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(schedule => (
                <tr key={schedule._id}>
                  <td>{getEmployeeName(schedule.employeeId)}</td>
                  <td>{schedule.position}</td>
                  <td>{schedule.startTime}</td>
                  <td>{schedule.endTime}</td>
                  <td>
                    <span className={`status ${schedule.status}`}>
                      {schedule.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {schedule.status === 'scheduled' && (
                        <>
                          <button
                            className="action-btn complete"
                            onClick={() => handleStatusChange(schedule._id, 'completed')}
                          >
                            Complete
                          </button>
                          <button
                            className="action-btn cancel"
                            onClick={() => handleStatusChange(schedule._id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(schedule._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WorkSchedule; 
