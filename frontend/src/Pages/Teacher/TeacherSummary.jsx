import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import {
  FaBell,
  FaClipboardList,
  FaStickyNote,
  FaDownload
} from "react-icons/fa";
import { MdAssignment } from "react-icons/md";
import Card, { CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const TeacherSummary = () => {
  const { id: teacherId } = useParams();

  const [data, setData] = useState({
    assignments: [],
    notices: [],
    materials: [],
    attendance: []
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assignments");

  useEffect(() => {
    fetchTeacherData();
  }, [teacherId]);

  const fetchTeacherData = async () => {
    try {
      const [assignmentsRes, noticesRes, materialsRes, attendanceRes] = await Promise.all([
        api.get(`/api/teacher/${teacherId}/assignments`),
        api.get(`/api/teacher/${teacherId}/notices`),
        api.get(`/api/teacher/${teacherId}/materials`),
        api.get(`/api/teacher/${teacherId}/attendance`).catch(() => ({ data: { attendance: [] } }))
      ]);

      setData({
        assignments: assignmentsRes.data.assignments || [],
        notices: noticesRes.data.notices || [],
        materials: materialsRes.data.materials || [],
        attendance: attendanceRes.data.attendance || []
      });

    } catch (err) {
      console.error("Error fetching teacher summary:", err);
      setData({
        assignments: [],
        notices: [],
        materials: [],
        attendance: []
      });
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ id, label, icon, count }) => (
    <Button
      variant={activeTab === id ? "primary" : "outline"}
      onClick={() => setActiveTab(id)}
      className="flex items-center gap-2"
    >
      {icon}
      <span>{label}</span>
      <span className={`ml-2 px-2 py-0.5 rounded text-xs ${activeTab === id ? 'bg-white/20' : 'bg-gray-100 text-text-secondary'}`}>
        {count}
      </span>
    </Button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">

          <h1 className="text-4xl font-bold text-secondary mb-2 font-heading">
            My Activity Summary
          </h1>
          <p className="text-text-secondary mb-8">
            Track your teaching activities and student engagement
          </p>

          {/* ========================= STATS OVERVIEW ========================= */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

            <SummaryCard
              value={data.assignments.length}
              title="My Assignments"
              icon={<MdAssignment className="text-primary text-3xl" />}
              borderColor="border-primary"
            />

            <SummaryCard
              value={data.notices.length}
              title="My Notices"
              icon={<FaBell className="text-secondary text-3xl" />}
              borderColor="border-secondary"
            />

            <SummaryCard
              value={data.materials.length}
              title="Materials Uploaded"
              icon={<FaStickyNote className="text-primary text-3xl" />}
              borderColor="border-primary"
            />

            <SummaryCard
              value={data.attendance.length}
              title="Classes Conducted"
              icon={<FaClipboardList className="text-secondary text-3xl" />}
              borderColor="border-secondary"
            />
          </div>

          {/* ========================= NAVIGATION TABS ========================= */}
          <div className="flex flex-wrap gap-4 mb-6">
            <TabButton
              id="assignments"
              label="My Assignments"
              icon={<MdAssignment />}
              count={data.assignments.length}
            />
            <TabButton
              id="notices"
              label="My Notices"
              icon={<FaBell />}
              count={data.notices.length}
            />
            <TabButton
              id="materials"
              label="My Materials"
              icon={<FaStickyNote />}
              count={data.materials.length}
            />
            <TabButton
              id="attendance"
              label="Attendance Summary"
              icon={<FaClipboardList />}
              count={data.attendance.length}
            />
          </div>

          {/* ========================= MAIN CONTENT ========================= */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              {/* -------- ASSIGNMENTS TAB -------- */}
              {activeTab === "assignments" && (
                <AssignmentsTab data={data.assignments} />
              )}

              {/* -------- NOTICES TAB -------- */}
              {activeTab === "notices" && <NoticesTab data={data.notices} />}

              {/* -------- MATERIALS TAB -------- */}
              {activeTab === "materials" && <MaterialsTab data={data.materials} />}

              {/* -------- ATTENDANCE TAB -------- */}
              {activeTab === "attendance" && (
                <AttendanceTab data={data.attendance} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherSummary;

/* =====================================================================
    REUSABLE COMPONENTS BELOW
===================================================================== */

const SummaryCard = ({ title, value, icon, borderColor }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${borderColor}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-text-secondary text-sm">{title}</p>
        <p className="text-3xl font-bold text-secondary font-heading">{value}</p>
      </div>
      {icon}
    </div>
  </div>
);

/* ---------------- TAB CONTENT COMPONENTS ---------------- */

const AssignmentsTab = ({ data }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-4 font-heading text-secondary">My Assignments</h2>

    {data.length === 0 ? (
      <p className="text-text-secondary text-center py-4">No assignments yet.</p>
    ) : (
      <div className="space-y-4">
        {data.map((a) => (
          <div key={a._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-secondary font-heading">{a.title}</h3>
                <p className="text-text-secondary">
                  {a.subjectId.subjectName} ({a.subjectId.subjectCode})
                </p>
                <p className="text-sm text-text-secondary">
                  Due: {new Date(a.deadline).toLocaleDateString()} | Created:{" "}
                  {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-primary">
                  {a.submittedCount}/{a.totalStudents}
                </p>
                <p className="text-xs text-text-secondary">Submitted</p>

                <button className="text-primary hover:text-primary/80 text-sm mt-2 font-medium">
                  View Submissions
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const NoticesTab = ({ data }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-4 font-heading text-secondary">My Notices</h2>

    {data.length === 0 ? (
      <p className="text-text-secondary text-center py-4">No notices posted.</p>
    ) : (
      data.map((n) => (
        <div key={n._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors mb-4">
          <h3 className="text-lg font-semibold text-secondary font-heading">{n.title}</h3>
          <p className="text-text-secondary mt-1">{n.description}</p>

          <p className="text-sm text-text-secondary mt-2">
            Course: {n.courseId.courseName} | Posted:{" "}
            {new Date(n.createdAt).toLocaleDateString()}
          </p>

          <p className="text-secondary font-bold mt-2">
            {n.studentCount} Students Reached
          </p>
        </div>
      ))
    )}
  </div>
);

const MaterialsTab = ({ data }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-4 font-heading text-secondary">My Study Materials</h2>

    {data.length === 0 ? (
      <p className="text-text-secondary text-center py-4">No materials uploaded yet.</p>
    ) : (
      data.map((m) => (
        <div key={m._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors mb-4">
          <h3 className="text-lg font-semibold text-secondary font-heading">{m.title}</h3>
          <p className="text-text-secondary">
            {m.subjectId.subjectName} ({m.subjectId.subjectCode})
          </p>
          <p className="text-sm text-text-secondary">
            Uploaded: {new Date(m.createdAt).toLocaleDateString()}
          </p>

          <div className="mt-2 flex items-center space-x-2">
            <a
              href={m.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              <FaDownload size={20} />
            </a>
          </div>
        </div>
      ))
    )}
  </div>
);

const AttendanceTab = ({ data }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-4 font-heading text-secondary">Attendance Summary</h2>

    {data.length === 0 ? (
      <p className="text-text-secondary text-center py-4">No attendance records yet.</p>
    ) : (
      data.map((rec) => {
        const percent =
          rec.totalStudents > 0
            ? Math.round((rec.presentCount / rec.totalStudents) * 100)
            : 0;

        return (
          <div key={rec._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-secondary font-heading">
                  {rec.subjectId.subjectName}
                </h3>
                <p className="text-text-secondary">
                  Date: {new Date(rec.date).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">
                    {rec.presentCount}
                  </p>
                  <p className="text-xs text-text-secondary">Present</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-secondary">
                    {rec.absentCount}
                  </p>
                  <p className="text-xs text-text-secondary">Absent</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">{percent}%</p>
                  <p className="text-xs text-text-secondary">Attendance</p>
                </div>
              </div>
            </div>
          </div>
        );
      })
    )}
  </div>
);
