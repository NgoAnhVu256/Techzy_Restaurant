import React, { useState, useEffect } from "react";
import "./WorkSchedule.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const WorkSchedule = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("timeGridWeek");
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    maNhanVien: "",
    maCa: "",
    ngayLam: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchData();
  }, [selectedEmployee, selectedDepartment]);

  const fetchData = async () => {
    try {
      const [schedulesRes, employeesRes, departmentsRes, shiftsRes] =
        await Promise.all([
          axios.get("http://localhost:5078/api/LichLamViec"),
          axios.get("http://localhost:5078/api/NhanVien"),
          axios.get("http://localhost:5078/api/BoPhan"),
          axios.get("http://localhost:5078/api/CaLamViec"),
        ]);

      setEmployees(employeesRes.data);
      setDepartments(departmentsRes.data);
      setShifts(shiftsRes.data);

      let filteredSchedules = schedulesRes.data;
      if (selectedEmployee) {
        filteredSchedules = filteredSchedules.filter(
          (s) => s.maNhanVien === selectedEmployee
        );
      }
      if (selectedDepartment) {
        const departmentEmployees = employeesRes.data
          .filter((e) => e.maBoPhan === selectedDepartment)
          .map((e) => e.maNhanVien);
        filteredSchedules = filteredSchedules.filter((s) =>
          departmentEmployees.includes(s.maNhanVien)
        );
      }

      const events = filteredSchedules.map((schedule) => {
        const employee = employeesRes.data.find(
          (e) => e.maNhanVien === schedule.maNhanVien
        );
        const shift = shiftsRes.data.find((s) => s.maCa === schedule.maCa);
        return {
          id: schedule.maLich,
          title: `${employee?.hoTen} - ${shift?.gioBatDau}-${shift?.gioKetThuc}`,
          start: new Date(schedule.ngayLam).toISOString(),
          end: new Date(schedule.ngayLam).toISOString(),
          extendedProps: {
            maNhanVien: schedule.maNhanVien,
            maCa: schedule.maCa,
          },
        };
      });

      setSchedules(events);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu");
    }
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setShowEditModal(true);
  };

  const handleDateSelect = (selectInfo) => {
    setNewSchedule({
      ...newSchedule,
      ngayLam: selectInfo.startStr,
    });
    setShowAddModal(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5078/api/LichLamViec", newSchedule);
      toast.success("Thêm lịch làm việc thành công");
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      toast.error("Lỗi khi thêm lịch làm việc");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5078/api/LichLamViec/${selectedEvent.id}`,
        {
          maNhanVien: selectedEvent.extendedProps.maNhanVien,
          maCa: selectedEvent.extendedProps.maCa,
          ngayLam: selectedEvent.start,
        }
      );
      toast.success("Cập nhật lịch làm việc thành công");
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      toast.error("Lỗi khi cập nhật lịch làm việc");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:5078/api/LichLamViec/${selectedEvent.id}`
      );
      toast.success("Xóa lịch làm việc thành công");
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      toast.error("Lỗi khi xóa lịch làm việc");
    }
  };

  const handleBack = () => {
    navigate("/human-resources");
  };

  return (
    <div className="work-schedule-container">
      <div className="work-schedule-header">
        <div className="header-left">
          <button className="back-button" onClick={handleBack}>
            <i className="fas fa-arrow-left"></i>
            Quay lại
          </button>
          <h2>Lịch làm việc</h2>
        </div>
        <div className="view-controls">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="">Tất cả bộ phận</option>
            {departments.map((dept) => (
              <option key={dept.maBoPhan} value={dept.maBoPhan}>
                {dept.tenBoPhan}
              </option>
            ))}
          </select>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="">Tất cả nhân viên</option>
            {employees
              .filter(
                (emp) =>
                  !selectedDepartment || emp.maBoPhan === selectedDepartment
              )
              .map((emp) => (
                <option key={emp.maNhanVien} value={emp.maNhanVien}>
                  {emp.hoTen}
                </option>
              ))}
          </select>
          <select value={view} onChange={(e) => setView(e.target.value)}>
            <option value="timeGridDay">Ngày</option>
            <option value="timeGridWeek">Tuần</option>
            <option value="dayGridMonth">Tháng</option>
          </select>
        </div>
      </div>

      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={view}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridDay,timeGridWeek,dayGridMonth",
          }}
          events={schedules}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          locale="vi"
          buttonText={{
            today: "Hôm nay",
            month: "Tháng",
            week: "Tuần",
            day: "Ngày",
          }}
        />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Thêm lịch làm việc</h2>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Nhân viên:</label>
                <select
                  required
                  value={newSchedule.maNhanVien}
                  onChange={(e) =>
                    setNewSchedule({
                      ...newSchedule,
                      maNhanVien: e.target.value,
                    })
                  }
                >
                  <option value="">Chọn nhân viên</option>
                  {employees.map((emp) => (
                    <option key={emp.maNhanVien} value={emp.maNhanVien}>
                      {emp.hoTen}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Ca làm việc:</label>
                <select
                  required
                  value={newSchedule.maCa}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, maCa: e.target.value })
                  }
                >
                  <option value="">Chọn ca làm việc</option>
                  {shifts.map((shift) => (
                    <option key={shift.maCa} value={shift.maCa}>
                      {shift.gioBatDau} - {shift.gioKetThuc}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="save-button">
                  Lưu
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedEvent && (
        <div className="modal">
          <div className="modal-content">
            <h2>Chỉnh sửa lịch làm việc</h2>
            <form onSubmit={handleEdit}>
              <div className="form-group">
                <label>Nhân viên:</label>
                <select
                  required
                  value={selectedEvent.extendedProps.maNhanVien}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      extendedProps: {
                        ...selectedEvent.extendedProps,
                        maNhanVien: e.target.value,
                      },
                    })
                  }
                >
                  {employees.map((emp) => (
                    <option key={emp.maNhanVien} value={emp.maNhanVien}>
                      {emp.hoTen}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Ca làm việc:</label>
                <select
                  required
                  value={selectedEvent.extendedProps.maCa}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      extendedProps: {
                        ...selectedEvent.extendedProps,
                        maCa: e.target.value,
                      },
                    })
                  }
                >
                  {shifts.map((shift) => (
                    <option key={shift.maCa} value={shift.maCa}>
                      {shift.gioBatDau} - {shift.gioKetThuc}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="save-button">
                  Lưu
                </button>
                <button
                  type="button"
                  className="delete-button"
                  onClick={handleDelete}
                >
                  Xóa
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowEditModal(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkSchedule;
