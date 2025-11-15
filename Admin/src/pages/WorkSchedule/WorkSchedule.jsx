import React, { useEffect, useMemo, useState } from "react";
import "./WorkSchedule.css";
import api from "../../utils/axios";
import { toast } from "react-toastify";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Typography,
  Breadcrumb,
  Radio,
  Tooltip,
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiCopy,
  FiCalendar,
  FiList,
} from "react-icons/fi";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

const { Text } = Typography;
const { RangePicker } = DatePicker;

const WorkSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" or "table"
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("isoWeek"),
    dayjs().endOf("isoWeek"),
  ]);
  const [filterEmployee, setFilterEmployee] = useState(null);
  const [filterShift, setFilterShift] = useState(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [copyForm] = Form.useForm();

  const fetchSchedules = async () => {
    try {
      const params = {};
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].format("YYYY-MM-DD");
        params.endDate = dateRange[1].format("YYYY-MM-DD");
      }
      if (filterEmployee) {
        params.maNhanVien = filterEmployee;
      }
      const response = await api.get("/workschedule", { params });
      setSchedules(response.data.data || []);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách lịch làm việc");
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/employees");
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchShifts = async () => {
    try {
      const response = await api.get("/shifts");
      setShifts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchShifts();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [dateRange, filterEmployee]);

  useEffect(() => {
    if (showEditModal && selectedSchedule) {
      editForm.setFieldsValue({
        ngayLamViec:
          selectedSchedule.NgayLamViec || selectedSchedule.ngayLamViec
            ? dayjs(
                selectedSchedule.NgayLamViec || selectedSchedule.ngayLamViec
              )
            : null,
        maNhanVien: selectedSchedule.MaNhanVien || selectedSchedule.maNhanVien,
        maCa: selectedSchedule.MaCa || selectedSchedule.maCa,
      });
    }
  }, [showEditModal, selectedSchedule, editForm]);

  const closeAddModal = () => {
    setShowAddModal(false);
    addForm.resetFields();
  };

  const handleAddSchedule = async (values) => {
    try {
      await api.post("/workschedule", {
        NgayLamViec: values.ngayLamViec.format("YYYY-MM-DD"),
        MaNhanVien: values.maNhanVien,
        MaCa: values.maCa,
      });
      toast.success("Thêm lịch làm việc thành công");
      fetchSchedules();
      closeAddModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Lỗi khi thêm lịch làm việc: " + errorMessage);
    }
  };

  const handleEditSchedule = async (values) => {
    if (!selectedSchedule) return;
    try {
      await api.put(
        `/workschedule/${selectedSchedule.MaLich || selectedSchedule.maLich}`,
        {
          NgayLamViec: values.ngayLamViec.format("YYYY-MM-DD"),
          MaNhanVien: values.maNhanVien,
          MaCa: values.maCa,
        }
      );
      toast.success("Cập nhật lịch làm việc thành công");
      fetchSchedules();
      setShowEditModal(false);
      setSelectedSchedule(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Lỗi khi cập nhật lịch làm việc: " + errorMessage);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!selectedSchedule) return;
    try {
      await api.delete(
        `/workschedule/${selectedSchedule.MaLich || selectedSchedule.maLich}`
      );
      toast.success("Xóa lịch làm việc thành công");
      fetchSchedules();
      setShowDeleteModal(false);
      setSelectedSchedule(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Lỗi khi xóa lịch làm việc: " + errorMessage);
    }
  };

  const handleCopySchedule = async (values) => {
    try {
      const fromStart = dayjs(values.fromWeek[0]);
      const fromEnd = dayjs(values.fromWeek[1]);
      const toStart = dayjs(values.toWeek[0]);

      // Lấy tất cả lịch trong tuần nguồn
      const fromSchedules = schedules.filter((s) => {
        const scheduleDate = dayjs(s.NgayLamViec || s.ngayLamViec);
        return scheduleDate >= fromStart && scheduleDate <= fromEnd;
      });

      // Tạo lịch mới cho tuần đích
      const daysDiff = toStart.diff(fromStart, "day");
      let successCount = 0;
      let errorCount = 0;

      for (const schedule of fromSchedules) {
        try {
          const newDate = dayjs(
            schedule.NgayLamViec || schedule.ngayLamViec
          ).add(daysDiff, "day");
          await api.post("/workschedule", {
            NgayLamViec: newDate.format("YYYY-MM-DD"),
            MaNhanVien: schedule.MaNhanVien || schedule.maNhanVien,
            MaCa: schedule.MaCa || schedule.maCa,
          });
          successCount++;
        } catch (err) {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Đã sao chép ${successCount} lịch làm việc`);
      }
      if (errorCount > 0) {
        toast.warning(
          `${errorCount} lịch không thể sao chép (có thể bị trùng)`
        );
      }
      fetchSchedules();
      setShowCopyModal(false);
      copyForm.resetFields();
    } catch (error) {
      toast.error("Lỗi khi sao chép lịch làm việc");
    }
  };

  // Filter schedules based on filters
  const filteredSchedules = useMemo(() => {
    let filtered = schedules;
    if (filterShift) {
      filtered = filtered.filter((s) => (s.MaCa || s.maCa) === filterShift);
    }
    return filtered;
  }, [schedules, filterShift]);

  // Generate week days
  const weekDays = useMemo(() => {
    if (!dateRange || !dateRange[0]) return [];
    const start = dateRange[0];
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(start.add(i, "day"));
    }
    return days;
  }, [dateRange]);

  // Get schedules for a specific date
  const getSchedulesForDate = (date) => {
    return filteredSchedules.filter((schedule) => {
      const scheduleDate = dayjs(schedule.NgayLamViec || schedule.ngayLamViec);
      return scheduleDate.format("YYYY-MM-DD") === date.format("YYYY-MM-DD");
    });
  };

  // Get shift color
  const getShiftColor = (shiftId) => {
    const shift = shifts.find((s) => (s.MaCa || s.maCa) === shiftId);
    if (!shift) return "#5d87ff";
    const shiftName = (shift.TenCa || shift.tenCa || "").toLowerCase();
    if (shiftName.includes("sáng") || shiftName.includes("sang"))
      return "#ffd699";
    if (shiftName.includes("chiều") || shiftName.includes("chieu"))
      return "#5d87ff";
    if (shiftName.includes("tối") || shiftName.includes("toi"))
      return "#7fe5c9";
    return "#5d87ff";
  };

  const columns = useMemo(
    () => [
      {
        title: "Ngày làm việc",
        dataIndex: "NgayLamViec",
        key: "NgayLamViec",
        render: (text, record) => {
          const date = text || record.ngayLamViec;
          return date ? dayjs(date).format("DD/MM/YYYY") : "-";
        },
        sorter: (a, b) => {
          const dateA = new Date(a.NgayLamViec || a.ngayLamViec || 0);
          const dateB = new Date(b.NgayLamViec || b.ngayLamViec || 0);
          return dateA - dateB;
        },
      },
      {
        title: "Nhân viên",
        key: "nhanVien",
        render: (_, record) => {
          const employee = record.nhanVien || record.NhanVien;
          return employee ? employee.HoTen || employee.hoTen : "-";
        },
      },
      {
        title: "Ca làm việc",
        key: "caLamViec",
        render: (_, record) => {
          const shift = record.caLamViec || record.CaLamViec;
          return shift
            ? `${shift.TenCa || shift.tenCa} (${
                shift.GioBatDau || shift.gioBatDau
              } - ${shift.GioKetThuc || shift.gioKetThuc})`
            : "-";
        },
      },
      {
        title: "Thao tác",
        key: "actions",
        render: (_, record) => (
          <Space>
            <Button
              icon={<FiEdit2 />}
              onClick={() => {
                setSelectedSchedule(record);
                setShowEditModal(true);
              }}
            >
              Sửa
            </Button>
            <Button
              icon={<FiTrash2 />}
              danger
              onClick={() => {
                setSelectedSchedule(record);
                setShowDeleteModal(true);
              }}
            >
              Xóa
            </Button>
          </Space>
        ),
      },
    ],
    []
  );

  return (
    <div className="workschedule-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Quản lý Nhân sự / Lịch làm việc</p>
          <h2>Quản lý Lịch làm việc</h2>
        </div>
      </div>

      {/* Toolbar */}
      <div className="workschedule-toolbar">
        <div className="toolbar-filters">
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange([dates[0], dates[1]]);
              }
            }}
            format="DD/MM/YYYY"
            placeholder={["Từ ngày", "Đến ngày"]}
            style={{ width: 280 }}
          />
          <Select
            placeholder="Lọc theo Nhân viên"
            allowClear
            value={filterEmployee}
            onChange={setFilterEmployee}
            style={{ width: 200 }}
            showSearch
            optionFilterProp="children"
          >
            {employees.map((emp) => (
              <Select.Option
                key={emp.MaNhanVien || emp.maNhanVien}
                value={emp.MaNhanVien || emp.maNhanVien}
              >
                {emp.HoTen || emp.hoTen}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Lọc theo Ca làm việc"
            allowClear
            value={filterShift}
            onChange={setFilterShift}
            style={{ width: 200 }}
            showSearch
            optionFilterProp="children"
          >
            {shifts.map((shift) => (
              <Select.Option
                key={shift.MaCa || shift.maCa}
                value={shift.MaCa || shift.maCa}
              >
                {shift.TenCa || shift.tenCa}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="toolbar-actions">
          <Radio.Group
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="calendar">
              <FiCalendar style={{ marginRight: 4 }} />
              Xem Lịch
            </Radio.Button>
            <Radio.Button value="table">
              <FiList style={{ marginRight: 4 }} />
              Xem Bảng
            </Radio.Button>
          </Radio.Group>
          <Button
            icon={<FiCopy />}
            onClick={() => {
              copyForm.resetFields();
              setShowCopyModal(true);
            }}
          >
            Sao chép Lịch
          </Button>
          <Button
            type="primary"
            icon={<FiPlus />}
            size="large"
            onClick={() => {
              addForm.resetFields();
              setShowAddModal(true);
            }}
          >
            Thêm Lịch làm việc
          </Button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="workschedule-calendar">
          <div className="calendar-header">
            {weekDays.map((day, index) => (
              <div key={index} className="calendar-day-header">
                <div className="day-name">
                  {day.format("dddd") === "Monday"
                    ? "Thứ 2"
                    : day.format("dddd") === "Tuesday"
                    ? "Thứ 3"
                    : day.format("dddd") === "Wednesday"
                    ? "Thứ 4"
                    : day.format("dddd") === "Thursday"
                    ? "Thứ 5"
                    : day.format("dddd") === "Friday"
                    ? "Thứ 6"
                    : day.format("dddd") === "Saturday"
                    ? "Thứ 7"
                    : "Chủ Nhật"}
                </div>
                <div className="day-date">{day.format("DD/MM")}</div>
              </div>
            ))}
          </div>
          <div className="calendar-body">
            {weekDays.map((day, dayIndex) => {
              const daySchedules = getSchedulesForDate(day);
              return (
                <div key={dayIndex} className="calendar-day-cell">
                  {daySchedules.map((schedule) => {
                    const employee = schedule.nhanVien || schedule.NhanVien;
                    const shift = schedule.caLamViec || schedule.CaLamViec;
                    const shiftColor = getShiftColor(
                      schedule.MaCa || schedule.maCa
                    );
                    return (
                      <Tooltip
                        key={schedule.MaLich || schedule.maLich}
                        title={`${
                          employee?.HoTen || employee?.hoTen || "N/A"
                        } - ${shift?.TenCa || shift?.tenCa || "N/A"} (${
                          shift?.GioBatDau || shift?.gioBatDau || ""
                        } - ${shift?.GioKetThuc || shift?.gioKetThuc || ""})`}
                      >
                        <div
                          className="schedule-event-card"
                          style={{ backgroundColor: shiftColor }}
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setShowEditModal(true);
                          }}
                        >
                          <div className="event-employee">
                            {employee?.HoTen || employee?.hoTen || "N/A"}
                          </div>
                          <div className="event-shift">
                            {shift?.TenCa || shift?.tenCa || "N/A"} (
                            {shift?.GioBatDau || shift?.gioBatDau || ""}-
                            {shift?.GioKetThuc || shift?.gioKetThuc || ""})
                          </div>
                        </div>
                      </Tooltip>
                    );
                  })}
                  {daySchedules.length === 0 && (
                    <div className="calendar-empty">Không có lịch</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="workschedule-card">
          <Table
            columns={columns}
            dataSource={filteredSchedules}
            rowKey={(record) => record.MaLich || record.maLich}
            pagination={{ pageSize: 10 }}
          />
        </div>
      )}

      {/* Add Modal */}
      <Modal
        title="Thêm lịch làm việc mới"
        open={showAddModal}
        onCancel={closeAddModal}
        footer={null}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={addForm}
          onFinish={handleAddSchedule}
          initialValues={{ ngayLamViec: dayjs(), maNhanVien: null, maCa: null }}
        >
          <Form.Item
            label="Ngày làm việc"
            name="ngayLamViec"
            rules={[{ required: true, message: "Vui lòng chọn ngày làm việc" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày làm việc"
            />
          </Form.Item>

          <Form.Item
            label="Nhân viên"
            name="maNhanVien"
            rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
          >
            <Select
              placeholder="Chọn nhân viên"
              showSearch
              optionFilterProp="children"
            >
              {employees.map((emp) => (
                <Select.Option
                  key={emp.MaNhanVien || emp.maNhanVien}
                  value={emp.MaNhanVien || emp.maNhanVien}
                >
                  {emp.HoTen || emp.hoTen}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Ca làm việc"
            name="maCa"
            rules={[{ required: true, message: "Vui lòng chọn ca làm việc" }]}
          >
            <Select
              placeholder="Chọn ca làm việc"
              showSearch
              optionFilterProp="children"
            >
              {shifts.map((shift) => (
                <Select.Option
                  key={shift.MaCa || shift.maCa}
                  value={shift.MaCa || shift.maCa}
                >
                  {shift.TenCa || shift.tenCa} (
                  {shift.GioBatDau || shift.gioBatDau} -{" "}
                  {shift.GioKetThuc || shift.gioKetThuc})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="modal-actions">
            <Button onClick={closeAddModal}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              Thêm
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa lịch làm việc"
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          setSelectedSchedule(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={editForm} onFinish={handleEditSchedule}>
          <Form.Item
            label="Ngày làm việc"
            name="ngayLamViec"
            rules={[{ required: true, message: "Vui lòng chọn ngày làm việc" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày làm việc"
            />
          </Form.Item>

          <Form.Item
            label="Nhân viên"
            name="maNhanVien"
            rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
          >
            <Select
              placeholder="Chọn nhân viên"
              showSearch
              optionFilterProp="children"
            >
              {employees.map((emp) => (
                <Select.Option
                  key={emp.MaNhanVien || emp.maNhanVien}
                  value={emp.MaNhanVien || emp.maNhanVien}
                >
                  {emp.HoTen || emp.hoTen}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Ca làm việc"
            name="maCa"
            rules={[{ required: true, message: "Vui lòng chọn ca làm việc" }]}
          >
            <Select
              placeholder="Chọn ca làm việc"
              showSearch
              optionFilterProp="children"
            >
              {shifts.map((shift) => (
                <Select.Option
                  key={shift.MaCa || shift.maCa}
                  value={shift.MaCa || shift.maCa}
                >
                  {shift.TenCa || shift.tenCa} (
                  {shift.GioBatDau || shift.gioBatDau} -{" "}
                  {shift.GioKetThuc || shift.gioKetThuc})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="modal-actions">
            <Button onClick={() => setShowEditModal(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              Lưu
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Copy Schedule Modal */}
      <Modal
        title="Sao chép Lịch làm việc"
        open={showCopyModal}
        onCancel={() => {
          setShowCopyModal(false);
          copyForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={copyForm} onFinish={handleCopySchedule}>
          <Form.Item
            label="Tuần nguồn"
            name="fromWeek"
            rules={[{ required: true, message: "Vui lòng chọn tuần nguồn" }]}
          >
            <RangePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </Form.Item>
          <Form.Item
            label="Tuần đích"
            name="toWeek"
            rules={[{ required: true, message: "Vui lòng chọn tuần đích" }]}
          >
            <RangePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </Form.Item>
          <div className="modal-actions">
            <Button onClick={() => setShowCopyModal(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              Sao chép
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        title="Xác nhận xóa"
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onOk={handleDeleteSchedule}
        okButtonProps={{ danger: true }}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xóa lịch làm việc này không?</p>
      </Modal>
    </div>
  );
};

export default WorkSchedule;
